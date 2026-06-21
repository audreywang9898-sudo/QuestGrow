import pool from './config/db.js';

async function run() {
  try {
    console.log('Running task_swap_count migration...');
    
    // Add swap_count column to tasks table if it does not exist
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS swap_count INT DEFAULT 0;
    `);
    
    console.log('Migration completed successfully. swap_count column added/verified.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

run();
