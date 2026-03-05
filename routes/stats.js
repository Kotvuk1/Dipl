const { Router } = require('express');
const { pool } = require('../core/db');
const { wall } = require('../core/shield');

let r = Router();

r.get('/', wall, async (req, res) => {
  let uRow = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.fbUser.uid]);
  if (uRow.rows.length === 0) return res.json({ signals: 0, trades: 0, winRate: 0, avgConf: 0 });
  let uid = uRow.rows[0].id;

  let sigCount = await pool.query('SELECT COUNT(*) as cnt FROM signals WHERE user_id = $1', [uid]);
  let tradeCount = await pool.query('SELECT COUNT(*) as cnt FROM trades WHERE user_id = $1', [uid]);
  let wins = await pool.query("SELECT COUNT(*) as cnt FROM trades WHERE user_id = $1 AND pnl > 0", [uid]);
  let avgConf = await pool.query('SELECT AVG(confidence) as avg FROM signals WHERE user_id = $1', [uid]);

  let totalTrades = +tradeCount.rows[0].cnt;
  let winC = +wins.rows[0].cnt;
  let wr = totalTrades > 0 ? +((winC / totalTrades) * 100).toFixed(1) : 0;

  let recentPnl = await pool.query(
    "SELECT DATE(created_at) as dt, SUM(pnl) as daily_pnl FROM trades WHERE user_id = $1 AND created_at > now() - interval '30 days' GROUP BY DATE(created_at) ORDER BY dt",
    [uid]
  );

  res.json({
    signals: +sigCount.rows[0].cnt,
    trades: totalTrades,
    winRate: wr,
    avgConfidence: avgConf.rows[0].avg ? +parseFloat(avgConf.rows[0].avg).toFixed(1) : 0,
    pnlHistory: recentPnl.rows,
  });
});

module.exports = r;
