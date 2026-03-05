const { Router } = require('express');

let r = Router();

r.get('/klines', async (req, res) => {
  let { symbol, interval, limit } = req.query;
  if (!symbol) return res.status(400).json({ err: 'symbol required' });
  let url = `https://api.binance.com/api/v3/klines?symbol=${(symbol || '').toUpperCase()}&interval=${interval || '1h'}&limit=${limit || 100}`;
  try {
    let resp = await fetch(url);
    let raw = await resp.json();
    if (!Array.isArray(raw)) return res.status(502).json({ err: 'binance_err' });
    let mapped = raw.map(c => ({
      time: Math.floor(c[0] / 1000),
      open: +c[1],
      high: +c[2],
      low: +c[3],
      close: +c[4],
      volume: +c[5],
    }));
    res.json(mapped);
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

r.get('/ticker', async (req, res) => {
  let sym = (req.query.symbol || 'BTCUSDT').toUpperCase();
  try {
    let resp = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
    let data = await resp.json();
    res.json({
      symbol: data.symbol,
      price: +data.lastPrice,
      change: +data.priceChangePercent,
      high: +data.highPrice,
      low: +data.lowPrice,
      volume: +data.volume,
    });
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

r.get('/pairs', async (req, res) => {
  try {
    let resp = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    let all = await resp.json();
    let usdt = all
      .filter(t => t.symbol.endsWith('USDT') && +t.quoteVolume > 1000000)
      .sort((a, b) => +b.quoteVolume - +a.quoteVolume)
      .slice(0, 50)
      .map(t => ({
        symbol: t.symbol,
        price: +t.lastPrice,
        change: +t.priceChangePercent,
        volume: +t.quoteVolume,
      }));
    res.json(usdt);
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

module.exports = r;
