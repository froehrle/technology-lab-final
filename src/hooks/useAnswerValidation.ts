import { useState } from 'react';
import { validateAnswerExternal } from '@/utils/externalValidation';

interface Question {
  id: string;
  question_type: string;
  correct_answer: string;
}

export const useAnswerValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateAnswer = async (
    question: Question,
    answerToSubmit: string
  ): Promise<{ correct: boolean; feedbackText: string }> => {
    setApiError(null);
    
    let correct = false;
    let feedbackText = '';

    try {
      if (question.question_type === 'text') {
        setIsValidating(true);
        const validationResult = await validateAnswerExternal(question.id, answerToSubmit);
        correct = validationResult.is_correct;
        feedbackText = validationResult.feedback_text;
      } else {
        // Use local validation for multiple choice and true/false questions
        correct = answerToSubmit === question.correct_answer;
      }
    } catch (error) {
      console.error('External validation failed:', error);
      setApiError('Validierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      throw error;
    } finally {
      setIsValidating(false);
    }

    return { correct, feedbackText };
  };

  const clearApiError = () => {
    setApiError(null);
  };

  return {
    isValidating,
    apiError,
    validateAnswer,
    clearApiError
  };
};