import pool from './config/db.js';

async function run() {
  console.log('Starting Push Subscriptions Table migration...');
  try {
    // Create the table to store user push subscriptions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          endpoint TEXT NOT NULL UNIQUE,
          p256dh TEXT NOT NULL,
          auth TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Push subscriptions table created successfully or already exists.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
    console.log('Database pool closed.');
  }
}

run();
