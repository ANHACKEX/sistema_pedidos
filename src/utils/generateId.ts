/**
 * Generates a unique ID for database records
 * Uses crypto.randomUUID() when available, falls back to custom implementation
 */
export const generateId = (): string => {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generates a shorter ID for display purposes
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};