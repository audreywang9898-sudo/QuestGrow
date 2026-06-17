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
  console.log("Starting family settings (zhuyin) migration...");
  try {
    await pool.query(`
      ALTER TABLE families 
      ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"zhuyinUnder8": true}'::jsonb;
    `);
    console.log("Successfully added settings column with default zhuyinUnder8: true to families table.");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
    console.log("Migration complete.");
  }
}

run();
