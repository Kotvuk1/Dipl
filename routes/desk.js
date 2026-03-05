const { Router } = require('express');
const { pool } = require('../core/db');
const { wall } = require('../core/shield');

let r = Router();

async function uid2id(fbUid) {
  let q = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [fbUid]);
  return q.rows.length > 0 ? q.rows[0].id : null;
}

r.get('/', wall, async (req, res) => {
  let userId = await uid2id(req.fbUser.uid);
  if (!userId) return res.json([]);
  let { rows } = await pool.query(
    'SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
    [userId]
  );
  res.json(rows);
});

r.post('/', wall, async (req, res) => {
  let userId = await uid2id(req.fbUser.uid);
  if (!userId) return res.status(403).json({ err: 'no_user' });
  let b = req.body;
  try {
    let { rows } = await pool.query(
      `INSERT INTO trades (user_id, signal_id, symbol, type, entry_price, amount, leverage, take_profit, stop_loss, order_type, source, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [userId, b.signal_id || null, b.symbol, b.type, b.entry_price, b.amount, b.leverage || 1, b.take_profit, b.stop_loss, b.order_type || 'MARKET', b.source || 'MANUAL', b.notes || null]
    );
    res.json(rows[0]);
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

r.patch('/:tid', wall, async (req, res) => {
  let userId = await uid2id(req.fbUser.uid);
  let b = req.body;
  try {
    let sets = [];
    let vals = [];
    let idx = 1;
    for (let k of ['status', 'pnl', 'notes', 'closed_at']) {
      if (b[k] !== undefined) {
        sets.push(`${k} = $${idx}`);
        vals.push(b[k]);
        idx++;
      }
    }
    if (sets.length === 0) return res.status(400).json({ err: 'nothing_to_update' });
    vals.push(req.params.tid);
    vals.push(userId);
    let { rows } = await pool.query(
      `UPDATE trades SET ${sets.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
      vals
    );
    res.json(rows[0] || { err: 'not_found' });
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

r.delete('/:tid', wall, async (req, res) => {
  let userId = await uid2id(req.fbUser.uid);
  await pool.query('DELETE FROM trades WHERE id = $1 AND user_id = $2', [req.params.tid, userId]);
  res.json({ ok: true });
});

module.exports = r;
