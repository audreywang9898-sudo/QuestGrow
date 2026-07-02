import pool from './config/db.js';

async function run() {
  try {
    console.log('Running token_version migration...');

    // Enables real JWT revocation: authenticateToken compares the token's
    // embedded token_version against this column, so incrementing it (on
    // logout-everywhere or password change) instantly invalidates every
    // previously-issued token for that user, even though JWTs are otherwise
    // stateless with a 7-day expiry.
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0;
    `);

    console.log('Migration completed successfully. token_version column added/verified.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

run();
