/**
 * Sanitize user input to prevent XSS attacks
 * Removes dangerous HTML tags and limits length
 */
export const sanitizeInput = (input, maxLength = 500) => {
  if (!input || typeof input !== 'string') return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove < and > to prevent HTML injection
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitize chat message content
 * Allows newlines but prevents XSS
 */
export const sanitizeChatMessage = (message) => {
  return sanitizeInput(message, 1000);
};

/**
 * Sanitize volunteer profile data
 */
export const sanitizeProfileData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, key === 'notes' ? 1000 : 200);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
