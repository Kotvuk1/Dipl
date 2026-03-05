const { Router } = require('express');
const { pool } = require('../core/db');
const { wall } = require('../core/shield');

let r = Router();

r.post('/sync', wall, async (req, res) => {
  let uid = req.fbUser.uid;
  let mail = req.fbUser.email || null;
  try {
    let found = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    if (found.rows.length > 0) {
      await pool.query('UPDATE users SET last_login = now() WHERE firebase_uid = $1', [uid]);
      let row = found.rows[0];
      return res.json({
        id: row.id,
        email: row.email,
        plan: row.plan,
        language: row.language,
        schedule: row.schedule,
      });
    }
    let ins = await pool.query(
      'INSERT INTO users (firebase_uid, email, last_login) VALUES ($1, $2, now()) RETURNING *',
      [uid, mail]
    );
    let nw = ins.rows[0];
    res.json({
      id: nw.id,
      email: nw.email,
      plan: nw.plan,
      language: nw.language,
      schedule: nw.schedule,
    });
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

r.patch('/profile', wall, async (req, res) => {
  let uid = req.fbUser.uid;
  let { language } = req.body;
  if (!language) return res.status(400).json({ err: 'missing_language' });
  try {
    let { rows } = await pool.query(
      'UPDATE users SET language = $1 WHERE firebase_uid = $2 RETURNING id, email, plan, language, schedule',
      [language, uid]
    );
    if (rows.length === 0) return res.status(404).json({ err: 'user_not_found' });
    res.json(rows[0]);
  } catch (ex) {
    res.status(500).json({ err: ex.message });
  }
});

module.exports = r;
