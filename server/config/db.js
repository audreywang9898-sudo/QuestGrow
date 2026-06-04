import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Auto-enable SSL for cloud databases (Render/Neon)
const isProductionDb = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('render.com') || 
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.NODE_ENV === 'production'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProductionDb ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Database connection pool established.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err);
});

export default pool;
