import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'async_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messages = {};
export const asyncLocalStorage = new AsyncLocalStorage();

try {
  const mdPath = path.join(__dirname, '../system_message.md');
  const fileContent = fs.readFileSync(mdPath, 'utf8');
  const lines = fileContent.split(/\r?\n/);
  // Match lines like: - **KEY_NAME**: Message text
  const regex = /^\s*-\s*\*\*([A-Z0-9_]+)\*\*:\s*(.+)$/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const key = match[1];
      const val = match[2].trim();
      const parts = val.split('|');
      messages[key] = {
        zh: parts[0] ? parts[0].trim() : val,
        en: parts[1] ? parts[1].trim() : (parts[0] ? parts[0].trim() : val)
      };
    }
  }
} catch (error) {
  console.error('Failed to load system_message.md:', error);
}

/**
 * Express middleware to bind Accept-Language header to the current request context.
 */
export const languageMiddleware = (req, res, next) => {
  const lang = req.headers['accept-language'] || 'zh';
  asyncLocalStorage.run({ lang }, () => {
    next();
  });
};

/**
 * Retrieve a system message by key and dynamically substitute placeholders.
 * @param {string} key - The message key (e.g. 'AUTH_TOKEN_MISSING')
 * @param {Object} [params] - Key-value pairs of variables to substitute (e.g. { name: 'Alex' })
 * @returns {string} The substituted message or the key itself if not found.
 */
export const getMessage = (key, params = {}) => {
  const store = asyncLocalStorage.getStore();
  const lang = (store?.lang || 'zh').toLowerCase().startsWith('en') ? 'en' : 'zh';

  const msgObj = messages[key];
  if (!msgObj) {
    console.warn(`System message key not found: ${key}`);
    return key;
  }
  let msg = msgObj[lang] || msgObj['zh'] || key;
  for (const [k, v] of Object.entries(params)) {
    msg = msg.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return msg;
};

export default getMessage;
