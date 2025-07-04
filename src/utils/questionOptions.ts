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
      // First parse attempt
      let parsed = JSON.parse(options);
      
      // If the result is still a string, parse again (double-encoded JSON)
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      
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