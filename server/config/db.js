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
  ssl: isProductionDb ? { rejectUnauthorized: false } : false,
  max: 15, // Increased from 5 to 15 to handle concurrent users safely
  idleTimeoutMillis: 3000, // Recycle idle connections quickly to prevent leaks
  connectionTimeoutMillis: 5000 // Increased from 2000ms to 5000ms to allow queue breathing room
});

pool.on('connect', () => {
  console.log('Database connection pool established.');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err.message);
  console.error('Error code:', err.code);
  // Do NOT re-throw — this would crash the process.
  // pg-pool handles recycling the broken client automatically.
});

export default pool;
