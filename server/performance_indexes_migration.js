import pool from './config/db.js';

async function run() {
  try {
    console.log('Running performance_indexes migration...');

    // schema.sql has no indexes beyond primary keys and the two UNIQUE
    // columns on users. These are the most-hit foreign key / filter columns
    // across the app (task lists, inventory/backpack, family membership
    // joins, and the cross-family leaderboard sort).
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_family_id_created ON tasks(family_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inventory_child_id ON inventory(child_id, date_acquired DESC);
      CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id);
      CREATE INDEX IF NOT EXISTS idx_families_growth_score ON families(growth_score DESC);
    `);

    console.log('Migration completed successfully. Performance indexes added/verified.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

run();
