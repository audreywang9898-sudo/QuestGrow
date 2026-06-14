/**
 * Server-side input validation utilities.
 * Centralised to keep validation logic consistent across all controllers.
 */

/**
 * Validates a required text field.
 * Returns an error message string if invalid, or null if valid.
 */
export const validateTextField = (value, fieldName, { required = false, maxLength = 500 } = {}) => {
  if (required && (!value || String(value).trim() === '')) {
    return `${fieldName} 為必填項目。`;
  }
  if (value !== undefined && value !== null && String(value).length > maxLength) {
    return `${fieldName} 不得超過 ${maxLength} 字元。`;
  }
  return null;
};

/**
 * Sanitizes a server error before sending to client.
 * In production, hides internal details; in development, shows the real message.
 */
export const safeErrorMessage = (error, fallback = '伺服器發生錯誤，請稍後再試。') => {
  if (process.env.NODE_ENV !== 'production') {
    return error?.message || fallback;
  }
  return fallback;
};
