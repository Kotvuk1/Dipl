const { Pool } = require('pg');

let _conn = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

async function scaffold() {
  try {
    await _conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT,
        plan TEXT DEFAULT 'free',
        language TEXT DEFAULT 'ru',
        schedule JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT now(),
        last_login TIMESTAMPTZ
      )
    `);
  } catch (e) { console.log('users table exists or error:', e.message); }

  try {
    await _conn.query(`
      CREATE TABLE IF NOT EXISTS signals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        symbol TEXT NOT NULL,
        timeframe TEXT NOT NULL,
        action TEXT NOT NULL,
        confidence INTEGER,
        reason JSONB,
        btc_corr NUMERIC,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
  } catch (e) { console.log('signals table:', e.message); }

  try {
    await _conn.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        signal_id UUID,
        symbol TEXT,
        type TEXT,
        status TEXT DEFAULT 'ACTIVE',
        entry_price NUMERIC,
        amount NUMERIC,
        leverage INTEGER DEFAULT 1,
        take_profit NUMERIC,
        stop_loss NUMERIC,
        order_type TEXT DEFAULT 'MARKET',
        source TEXT DEFAULT 'MANUAL',
        pnl NUMERIC DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        closed_at TIMESTAMPTZ
      )
    `);
  } catch (e) { console.log('trades table:', e.message); }

  try {
    await _conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        type TEXT,
        message TEXT,
        data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
  } catch (e) { console.log('notifications table:', e.message); }

  try {
    await _conn.query(`
      CREATE TABLE IF NOT EXISTS backtests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        symbol TEXT,
        period TEXT,
        total_signals INTEGER,
        correct INTEGER,
        accuracy NUMERIC,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
  } catch (e) { console.log('backtests table:', e.message); }
}

module.exports = { pool: _conn, scaffold };
