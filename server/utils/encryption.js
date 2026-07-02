import crypto from 'crypto';

/**
 * Field-level encryption for sensitive PII columns (currently: children.birthday).
 * Uses AES-256-GCM (authenticated encryption) with a random IV per value.
 * Requires PII_ENCRYPTION_KEY in the environment: a base64-encoded 32-byte key.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCODING_PREFIX = 'enc:v1:';

const getKey = () => {
  const keyB64 = process.env.PII_ENCRYPTION_KEY;
  if (!keyB64) {
    throw new Error('PII_ENCRYPTION_KEY is not set — cannot encrypt/decrypt PII fields.');
  }
  const key = Buffer.from(keyB64, 'base64');
  if (key.length !== 32) {
    throw new Error('PII_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256).');
  }
  return key;
};

export const encryptField = (plaintext) => {
  if (plaintext === null || plaintext === undefined || plaintext === '') return plaintext;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return ENCODING_PREFIX + Buffer.concat([iv, authTag, ciphertext]).toString('base64');
};

export const decryptField = (stored) => {
  if (stored === null || stored === undefined || stored === '') return stored;
  if (!stored.startsWith(ENCODING_PREFIX)) {
    // Legacy/unmigrated plaintext value — return as-is instead of throwing,
    // so a row that hasn't been through the migration doesn't 500 the request.
    return stored;
  }
  const key = getKey();
  const raw = Buffer.from(stored.slice(ENCODING_PREFIX.length), 'base64');
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
};
