import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messages = {};

try {
  const mdPath = path.join(__dirname, '../system_message.md');
  const fileContent = fs.readFileSync(mdPath, 'utf8');
  const lines = fileContent.split(/\r?\n/);
  // Match lines like: - **KEY_NAME**: Message text
  const regex = /^\s*-\s*\*\*([A-Z0-9_]+)\*\*:\s*(.+)$/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      messages[match[1]] = match[2].trim();
    }
  }
} catch (error) {
  console.error('Failed to load system_message.md:', error);
}

/**
 * Retrieve a system message by key and dynamically substitute placeholders.
 * @param {string} key - The message key (e.g. 'AUTH_TOKEN_MISSING')
 * @param {Object} [params] - Key-value pairs of variables to substitute (e.g. { name: 'Alex' })
 * @returns {string} The substituted message or the key itself if not found.
 */
export const getMessage = (key, params = {}) => {
  let msg = messages[key];
  if (!msg) {
    console.warn(`System message key not found: ${key}`);
    return key;
  }
  for (const [k, v] of Object.entries(params)) {
    msg = msg.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return msg;
};

export default getMessage;
