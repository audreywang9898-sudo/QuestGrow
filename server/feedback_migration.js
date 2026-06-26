import pool from './config/db.js';

async function run() {
  console.log('Starting Feedbacks Table migration...');
  try {
    // 1. Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          family_id UUID REFERENCES families(id) ON DELETE SET NULL,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          content TEXT NOT NULL,
          status VARCHAR(50) DEFAULT '待處理' CHECK (status IN ('待處理', '處理中', '已解決')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Feedbacks table created successfully or already exists.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
    console.log('Database pool closed.');
  }
}

run();
