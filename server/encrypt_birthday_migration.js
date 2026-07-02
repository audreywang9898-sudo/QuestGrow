import pool from './config/db.js';
import { encryptField, decryptField } from './utils/encryption.js';

async function run() {
  try {
    console.log('Running encrypt_birthday migration...');

    // 1. Widen the column — VARCHAR(50) is too small for AES-GCM ciphertext
    // (iv + authTag + ciphertext, base64-encoded, plus our "enc:v1:" prefix).
    await pool.query(`ALTER TABLE children ALTER COLUMN birthday TYPE TEXT;`);
    console.log('Step 1: children.birthday widened to TEXT.');

    // 2. Encrypt any existing plaintext values. Idempotent: skips rows that
    // are already encrypted (decryptField returns the value unchanged for
    // legacy plaintext, so we detect "already encrypted" via the prefix).
    const { rows } = await pool.query('SELECT id, birthday FROM children WHERE birthday IS NOT NULL');
    let migrated = 0;
    for (const row of rows) {
      if (row.birthday.startsWith('enc:v1:')) continue; // already encrypted
      const encrypted = encryptField(row.birthday);
      await pool.query('UPDATE children SET birthday = $1 WHERE id = $2', [encrypted, row.id]);
      migrated++;
    }
    console.log(`Step 2: encrypted ${migrated} of ${rows.length} children.birthday value(s) (rest were already encrypted).`);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

run();
