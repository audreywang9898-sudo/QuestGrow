/**
 * Migration: Add line_review_token column to tasks and inventory tables.
 * This one-time token is generated when a child submits a task or redeems an item,
 * and is consumed (set to NULL) after the parent approves or rejects via LINE Bot.
 * Also adds reviewed_at / redeemed_at timestamps if not present.
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // tasks table
    await client.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS line_review_token TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL
    `);
    console.log('✅ tasks: line_review_token, reviewed_at added');

    // inventory table
    await client.query(`
      ALTER TABLE inventory
      ADD COLUMN IF NOT EXISTS line_review_token TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMPTZ DEFAULT NULL
    `);
    console.log('✅ inventory: line_review_token, redeemed_at added');

    await client.query('COMMIT');
    console.log('✅ line_review_token migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
