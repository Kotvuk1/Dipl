const { Router } = require('express');
const { pool } = require('../core/db');
const { wall } = require('../core/shield');

let r = Router();

r.get('/', wall, async (req, res) => {
  let uRow = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.fbUser.uid]);
  if (uRow.rows.length === 0) return res.json([]);
  let userId = uRow.rows[0].id;
  let lim = Math.min(parseInt(req.query.limit) || 20, 100);
  let { rows } = await pool.query(
    'SELECT * FROM signals WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, lim]
  );
  res.json(rows);
});

r.get('/:sid', wall, async (req, res) => {
  let { rows } = await pool.query('SELECT * FROM signals WHERE id = $1', [req.params.sid]);
  res.json(rows[0] || null);
});

module.exports = r;
