const { Router } = require('express');
const { pool } = require('../core/db');
const { wall } = require('../core/shield');

let r = Router();

r.get('/', wall, async (req, res) => {
  let uRow = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.fbUser.uid]);
  if (uRow.rows.length === 0) return res.json([]);
  let userId = uRow.rows[0].id;
  let { rows } = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [userId]
  );
  res.json(rows);
});

r.patch('/:nid/read', wall, async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [req.params.nid]);
  res.json({ ok: true });
});

r.post('/mark-all', wall, async (req, res) => {
  let uRow = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.fbUser.uid]);
  if (uRow.rows.length === 0) return res.json({ ok: true });
  await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [uRow.rows[0].id]);
  res.json({ ok: true });
});

module.exports = r;
