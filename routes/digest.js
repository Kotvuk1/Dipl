const { Router } = require('express');

let r = Router();
let _cache = {};

r.get('/', async (req, res) => {
  let coin = (req.query.coin || '').toUpperCase();
  let cacheKey = coin || '_all';
  let now = Date.now();

  if (_cache[cacheKey] && now - _cache[cacheKey].ts < 120000) {
    return res.json(_cache[cacheKey].data);
  }

  try {
    let url = 'https://min-api.cryptocompare.com/data/v2/news/?lang=RU&sortOrder=latest';
    if (coin) url += `&categories=${coin}`;
    let resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    let body = await resp.json();
    let items = ((body.Data) || []).slice(0, 20).map(p => ({
      title: p.title,
      url: p.url,
      source: p.source_info ? p.source_info.name : p.source,
      published: new Date(p.published_on * 1000).toISOString(),
      currencies: p.categories ? p.categories.split('|').filter(Boolean).slice(0, 3) : [],
    }));
    _cache[cacheKey] = { data: items, ts: now };
    res.json(items);
  } catch (ex) {
    res.status(500).json({ err: 'news_unavailable' });
  }
});

module.exports = r;
