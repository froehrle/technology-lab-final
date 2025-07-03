/**
 * Utility functions for parsing question options from various formats
 */

/**
 * Parses question options from database format to string array
 * Handles JSON strings, arrays, objects, and null values
 */
export const parseQuestionOptions = (options: any): string[] => {
  if (!options) {
    return [];
  }
  
  if (Array.isArray(options)) {
    return options;
  }
  
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  if (typeof options === 'object') {
    return Object.values(options) as string[];
  }
  
  return [];
};