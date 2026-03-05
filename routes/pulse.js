const { Router } = require('express');
const { pool } = require('../core/db');
const { wall } = require('../core/shield');
const { runPrompt } = require('../core/vault');

let r = Router();

function computeRSI(closes, period) {
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    let diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  let ag = gains / period;
  let al = losses / period;
  if (al === 0) return 100;
  let rs = ag / al;
  return +(100 - 100 / (1 + rs)).toFixed(2);
}

function computeEMA(data, span) {
  let k = 2 / (span + 1);
  let ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function computeMACD(closes) {
  let fast = computeEMA(closes, 12);
  let slow = computeEMA(closes, 26);
  let line = fast.map((v, i) => v - slow[i]);
  let signal = computeEMA(line.slice(26), 9);
  let latest = line[line.length - 1];
  let latestSig = signal[signal.length - 1];
  return {
    line: +latest.toFixed(4),
    signal: +latestSig.toFixed(4),
    histogram: +(latest - latestSig).toFixed(4),
  };
}

function computeBB(closes, period, mult) {
  let slice = closes.slice(-period);
  let avg = slice.reduce((s, v) => s + v, 0) / period;
  let variance = slice.reduce((s, v) => s + (v - avg) ** 2, 0) / period;
  let sd = Math.sqrt(variance);
  return {
    mid: +avg.toFixed(2),
    upper: +(avg + sd * mult).toFixed(2),
    lower: +(avg - sd * mult).toFixed(2),
  };
}

function pearson(a, b) {
  let n = Math.min(a.length, b.length);
  let xa = a.slice(-n), xb = b.slice(-n);
  let ma = xa.reduce((s, v) => s + v, 0) / n;
  let mb = xb.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    let diffA = xa[i] - ma, diffB = xb[i] - mb;
    num += diffA * diffB;
    da += diffA ** 2;
    db += diffB ** 2;
  }
  let denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : +(num / denom).toFixed(4);
}

async function grabCandles(sym, interval, count) {
  let url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${count}`;
  let resp = await fetch(url);
  let raw = await resp.json();
  if (!Array.isArray(raw)) throw new Error('binance returned bad data');
  return raw.map(c => ({
    ts: c[0],
    open: +c[1],
    high: +c[2],
    low: +c[3],
    close: +c[4],
    vol: +c[5],
  }));
}

async function grabNews(coin) {
  try {
    let base = coin.replace('USDT', '').replace('BUSD', '');
    let url = `https://cryptopanic.com/api/free/v1/posts/?auth_token=pub_free&currencies=${base}&kind=news&public=true`;
    let resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    let data = await resp.json();
    if (data.results && data.results.length > 0) {
      return data.results.slice(0, 5).map(p => p.title).join('; ');
    }
    return 'нет актуальных новостей';
  } catch (e) {
    return 'не удалось получить новости';
  }
}

r.post('/analyze', wall, async (req, res) => {
  let { symbol, timeframe } = req.body;
  if (!symbol || !timeframe) return res.status(400).json({ err: 'symbol and timeframe required' });

  let sym = symbol.toUpperCase();
  try {
    let candles = await grabCandles(sym, timeframe, 200);
    let closes = candles.map(c => c.close);
    let lastPrice = closes[closes.length - 1];

    let rsi = computeRSI(closes, 14);
    let macd = computeMACD(closes);
    let ema20 = computeEMA(closes, 20);
    let ema50 = computeEMA(closes, 50);
    let ema200 = computeEMA(closes, 200);
    let bb = computeBB(closes, 20, 2);

    let btcCorr = null;
    if (!sym.startsWith('BTC')) {
      let btcCandles = await grabCandles('BTCUSDT', timeframe, 50);
      let btcCloses = btcCandles.map(c => c.close);
      btcCorr = pearson(closes.slice(-50), btcCloses);
    }

    let newsText = await grabNews(sym);

    let prompt = `Ты торговый аналитик. Без markdown, без смайликов, без заголовков. Только сухой профессиональный текст.\n\nДай анализ ${sym} на таймфрейме ${timeframe}:\nRSI: ${rsi}\nMACD: line=${macd.line}, signal=${macd.signal}, hist=${macd.histogram}\nEMA20: ${ema20[ema20.length - 1].toFixed(2)}, EMA50: ${ema50[ema50.length - 1].toFixed(2)}, EMA200: ${ema200[ema200.length - 1].toFixed(2)}\nBollinger Bands: upper=${bb.upper}, mid=${bb.mid}, lower=${bb.lower}\nПоследняя цена: ${lastPrice}\nНовостной фон: ${newsText}\nКорреляция с BTC: ${btcCorr !== null ? btcCorr : 'N/A (это BTC)'}\n\nВерни JSON строго в формате:\n{"action":"LONG","confidence":75,"reason":{"indicators":"текст","priceAction":"текст","news":"текст","risks":"текст"}}`;

    let aiRaw = await runPrompt(prompt);

    let parsed;
    try {
      let jsonMatch = aiRaw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch (pe) {
      parsed = { action: 'HOLD', confidence: 50, reason: { indicators: aiRaw, priceAction: '', news: '', risks: '' } };
    }

    let userId = null;
    let uRow = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.fbUser.uid]);
    if (uRow.rows.length > 0) userId = uRow.rows[0].id;

    let sigRow = await pool.query(
      `INSERT INTO signals (user_id, symbol, timeframe, action, confidence, reason, btc_corr)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, sym, timeframe, parsed.action, parsed.confidence, JSON.stringify(parsed.reason), btcCorr]
    );

    if (parsed.confidence >= 80 && userId) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, data)
         VALUES ($1, $2, $3, $4)`,
        [userId, 'signal', `Сильный сигнал ${parsed.action} по ${sym} (${parsed.confidence}%)`,
         JSON.stringify({ signal_id: sigRow.rows[0].id })]
      );
    }

    res.json({
      signal: sigRow.rows[0],
      indicators: { rsi, macd, ema20: +ema20[ema20.length - 1].toFixed(2), ema50: +ema50[ema50.length - 1].toFixed(2), ema200: +ema200[ema200.length - 1].toFixed(2), bb },
      price: lastPrice,
      btcCorr,
    });
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

r.post('/chat', wall, async (req, res) => {
  let { message } = req.body;
  if (!message) return res.status(400).json({ err: 'no_message' });
  try {
    let prompt = `Ты — торговый ИИ-ассистент KotvukAI. Отвечай кратко и по делу на вопросы о криптовалютном рынке, трейдинге, индикаторах и стратегиях. Отвечай на русском языке.\n\nВопрос пользователя: ${message}`;
    let reply = await runPrompt(prompt);
    res.json({ reply });
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

module.exports = r;
