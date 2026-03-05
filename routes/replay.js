const { Router } = require('express');
const { pool } = require('../core/db');
const { wall } = require('../core/shield');
const { runPrompt } = require('../core/vault');

let r = Router();

function calcRSI(closes, period) {
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    let d = closes[i] - closes[i - 1];
    if (d > 0) gains += d;
    else losses += Math.abs(d);
  }
  let ag = gains / period;
  let al = losses / period;
  if (al === 0) return 100;
  return +(100 - 100 / (1 + ag / al)).toFixed(2);
}

r.post('/', wall, async (req, res) => {
  let { symbol, period } = req.body;
  if (!symbol || !period) return res.status(400).json({ err: 'missing params' });

  let sym = symbol.toUpperCase();
  let intervals = { '7d': '1h', '30d': '4h', '90d': '1d' };
  let limits = { '7d': 168, '30d': 180, '90d': 90 };
  let tf = intervals[period] || '4h';
  let lim = limits[period] || 100;

  try {
    let resp = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${tf}&limit=${lim}`);
    let raw = await resp.json();
    if (!Array.isArray(raw)) return res.status(502).json({ err: 'binance_err' });
    let closes = raw.map(c => +c[4]);

    let windowSize = 14;
    let totalSignals = 0;
    let correctOnes = 0;

    for (let i = windowSize + 1; i < closes.length - 5; i++) {
      let slice = closes.slice(0, i + 1);
      let rsi = calcRSI(slice, 14);
      let predicted = rsi < 30 ? 'LONG' : rsi > 70 ? 'SHORT' : null;
      if (!predicted) continue;
      totalSignals++;
      let futurePrice = closes[Math.min(i + 5, closes.length - 1)];
      let curPrice = closes[i];
      if (predicted === 'LONG' && futurePrice > curPrice) correctOnes++;
      if (predicted === 'SHORT' && futurePrice < curPrice) correctOnes++;
    }

    let accuracy = totalSignals > 0 ? +((correctOnes / totalSignals) * 100).toFixed(1) : 0;

    let uRow = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.fbUser.uid]);
    let userId = uRow.rows.length > 0 ? uRow.rows[0].id : null;

    if (userId) {
      await pool.query(
        'INSERT INTO backtests (user_id, symbol, period, total_signals, correct, accuracy) VALUES ($1,$2,$3,$4,$5,$6)',
        [userId, sym, period, totalSignals, correctOnes, accuracy]
      );
    }

    res.json({ symbol: sym, period, totalSignals, correct: correctOnes, accuracy });
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

r.get('/history', wall, async (req, res) => {
  let uRow = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.fbUser.uid]);
  if (uRow.rows.length === 0) return res.json([]);
  let { rows } = await pool.query(
    'SELECT * FROM backtests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
    [uRow.rows[0].id]
  );
  res.json(rows);
});

module.exports = r;
