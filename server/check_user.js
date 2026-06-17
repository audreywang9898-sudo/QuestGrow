import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query("SELECT id, email, role, google_id FROM users");
    console.log('User records:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
