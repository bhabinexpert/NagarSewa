/**
 * =============================================================================
 * VALIDATION UTILITIES
 * =============================================================================
 * Input validation helpers
 */

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names (optional, defaults to all keys in data)
 * @returns {Object} { isValid: boolean, missing: Array, message: string }
 */
export const validateRequiredFields = (data, requiredFields) => {
  // If no requiredFields array provided, use all keys from data object
  const fieldsToCheck = requiredFields || Object.keys(data);
  
  const missing = fieldsToCheck.filter(field => !data[field]);
  return {
    isValid: missing.length === 0,
    missing,
    message: missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : ''
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

/**
 * Validate ward number for Damak Municipality
 * @param {number} wardNumber - Ward number to validate
 * @returns {boolean}
 */
export const isValidWardNumber = (wardNumber) => {
  return wardNumber >= 1 && wardNumber <= 10;
};
