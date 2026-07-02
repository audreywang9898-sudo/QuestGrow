import pool from './config/db.js';

async function run() {
  try {
    console.log('Running wishlist_approval migration...');

    // Enables a parent-approval gate on kid-triggered wishlist redemptions:
    // a kid "requesting" a redemption sets these two columns without yet
    // deducting family points; a parent then approves (deducts points,
    // marks is_redeemed) or rejects (clears these columns back to null).
    // Parent-triggered redemptions still happen instantly (parents already
    // have redemption authority — no self-review needed).
    await pool.query(`
      ALTER TABLE wishlist
      ADD COLUMN IF NOT EXISTS redeem_requested_by UUID REFERENCES children(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS redeem_requested_at TIMESTAMP WITH TIME ZONE;
    `);

    console.log('Migration completed successfully. wishlist redeem_requested_by/redeem_requested_at columns added/verified.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

run();
