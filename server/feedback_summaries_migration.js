import pool from './config/db.js';

async function run() {
  console.log('Starting Feedback Summaries Table migration...');
  try {
    // 1. Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback_summaries (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          report_date DATE UNIQUE DEFAULT CURRENT_DATE,
          content TEXT NOT NULL,
          analytics_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Feedback summaries table created successfully or already exists.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
    console.log('Database pool closed.');
  }
}

run();
