import pool from './config/db.js';
import { GACHA_POOL } from '../src/utils/mockData.js';

async function run() {
  try {
    await pool.query('UPDATE families SET gacha_pool = $1', [JSON.stringify(GACHA_POOL)]);
    console.log('Successfully updated all families gacha pools to the new 40-card default pool!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}
run();
