/**
 * Utility functions to clean AI-generated question data for display
 */

/**
 * Cleans the question text by removing redundant options list
 * @param questionText - The raw question text from AI
 * @returns Cleaned question text without options list
 */
export const cleanQuestionText = (questionText: string): string => {
  if (!questionText) return '';
  
  // Common patterns where options start in AI-generated questions
  const optionPatterns = [
    /\s+a\)/i,  // " a)"
    /\?\s+a\)/i, // "? a)"
    /:\s+a\)/i,  // ": a)"
    /\s+\(?a\)/i // " (a)" or " a)"
  ];
  
  // Find the first occurrence of any option pattern
  let splitIndex = -1;
  for (const pattern of optionPatterns) {
    const match = questionText.search(pattern);
    if (match !== -1 && (splitIndex === -1 || match < splitIndex)) {
      splitIndex = match;
    }
  }
  
  // If we found an option pattern, take everything before it
  if (splitIndex !== -1) {
    return questionText.substring(0, splitIndex).trim();
  }
  
  return questionText.trim();
};

/**
 * Cleans an individual option by removing letter prefixes
 * @param option - The raw option text
 * @returns Cleaned option text without prefixes
 */
export const cleanOption = (option: string): string => {
  if (!option) return '';
  
  // Remove common letter prefixes: a), b), c), d), etc.
  // Also handle variations like (a), A), (A), a., A.
  const cleaned = option
    .replace(/^\s*\(?[a-zA-Z]\)?\s*[.)]?\s*/, '') // Remove letter prefixes
    .trim();
  
  return cleaned;
};

/**
 * Cleans all options in an array
 * @param options - Array of raw option strings
 * @returns Array of cleaned option strings
 */
export const cleanOptions = (options: string[]): string[] => {
  return options.map(cleanOption);
};

/**
 * Cleans the correct answer to match cleaned options
 * @param correctAnswer - The raw correct answer
 * @returns Cleaned correct answer
 */
export const cleanCorrectAnswer = (correctAnswer: string): string => {
  if (!correctAnswer) return '';
  return cleanOption(correctAnswer);
};

/**
 * Processes question data for display by cleaning all relevant fields
 * @param question - Question object with raw data
 * @returns Question object with cleaned display data
 */
export const processQuestionForDisplay = (question: any) => {
  const cleanedQuestionText = cleanQuestionText(question.question_text);
  
  // Parse and clean options
  let rawOptions: string[] = [];
  if (Array.isArray(question.options)) {
    rawOptions = question.options;
  } else if (typeof question.options === 'string') {
    try {
      const parsed = JSON.parse(question.options);
      rawOptions = Array.isArray(parsed) ? parsed : [];
    } catch {
      rawOptions = [];
    }
  } else if (question.options && typeof question.options === 'object') {
    rawOptions = Object.values(question.options) as string[];
  }
  
  const cleanedOptions = cleanOptions(rawOptions);
  const cleanedCorrectAnswer = cleanCorrectAnswer(question.correct_answer || '');
  
  return {
    ...question,
    displayQuestionText: cleanedQuestionText,
    displayOptions: cleanedOptions,
    displayCorrectAnswer: cleanedCorrectAnswer
  };
};