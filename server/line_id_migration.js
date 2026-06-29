import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;
const isProductionDb = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('render.com') || 
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.NODE_ENV === 'production'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProductionDb ? { rejectUnauthorized: false } : false
});

async function run() {
  console.log("Starting LINE ID user table migration...");
  try {
    // 1. Add line_id column to users table if not exists
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS line_id VARCHAR(255) UNIQUE;
    `);
    console.log("Successfully added line_id column to users table.");

    // 2. Create index on line_id column if not exists
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_line_id ON users(line_id);
    `);
    console.log("Successfully created index idx_users_line_id on users table.");

  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
    console.log("Migration complete.");
  }
}

run();
