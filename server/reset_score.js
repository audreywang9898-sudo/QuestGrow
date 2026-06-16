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
  console.log("Starting initial growth score reset to 0...");
  try {
    // Update default for new records in case it wasn't set (though we modified schema.sql, ALTER TABLE makes sure it applies to live schema)
    await pool.query(`
      ALTER TABLE families ALTER COLUMN growth_score SET DEFAULT 0;
    `);
    console.log("Updated default for families.growth_score to 0.");

    // Update existing families growth_score to 0
    await pool.query(`
      UPDATE families SET growth_score = 0;
    `);
    console.log("Updated all existing families' growth_score to 0.");

    // Update wishlist items that are linked to initial seed or are current
    await pool.query(`
      UPDATE wishlist SET points_current = 0 WHERE id = 'ffff1111-1111-1111-1111-111111111111';
    `);
    console.log("Updated seed wishlist item points_current to 0.");

    console.log("Initial growth score reset successfully completed!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
    console.log("DB connection closed.");
  }
}

run();
