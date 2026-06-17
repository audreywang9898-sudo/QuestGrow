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
  console.log("Starting children defaults migration...");
  try {
    // Modify column defaults to 0
    await pool.query(`
      ALTER TABLE children ALTER COLUMN gold SET DEFAULT 0;
      ALTER TABLE children ALTER COLUMN tickets SET DEFAULT 0;
    `);
    console.log("Successfully altered children table columns (gold, tickets) to DEFAULT 0.");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
    console.log("Migration complete.");
  }
}

run();
