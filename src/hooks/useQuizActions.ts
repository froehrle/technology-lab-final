
import { useQuizState } from './useQuizState';
import { useAchievements } from './useAchievements';
import { calculateXP, calculateNewFocusPoints, shouldAllowProceed } from '@/utils/quizScoring';
import { showAnswerFeedback, showQuizCompletionToast } from '@/utils/quizFeedback';
import { validateAnswerExternal } from '@/utils/externalValidation';
import { useState } from 'react';

export const useQuizActions = (courseId: string) => {
  const [isValidating, setIsValidating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);

  const {
    currentQuestionIndex,
    selectedAnswer,
    textAnswer,
    focusPoints,
    questionAttempts,
    questions,
    setSelectedAnswer,
    setTextAnswer,
    setShowResult,
    setIsCorrect,
    setFocusPoints,
    setQuestionAttempts,
    setCanProceed,
    setCurrentQuestionIndex,
    updateQuizAttemptMutation,
    submitAnswerMutation,
    updateProgressMutation,
    toast,
    queryClient,
    ...rest
  } = useQuizState(courseId);

  const { checkForNewAchievements } = useAchievements();

  const handleAnswerSelect = (answer: string) => {
    if (rest.showResult && rest.canProceed) return;
    setSelectedAnswer(answer);
    setApiError(null);
  };

  const handleTextAnswerChange = (answer: string) => {
    setTextAnswer(answer);
    setApiError(null);
  };

  const clearAutoProgressTimer = () => {
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      setAutoProgressTimer(null);
    }
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answerToSubmit = currentQuestion?.question_type === 'text' ? textAnswer : selectedAnswer;
    if (!answerToSubmit || !currentQuestion) return;

    clearAutoProgressTimer();
    setApiError(null);

    const currentAttempts = questionAttempts[currentQuestion.id] || 0;
    const newAttempts = currentAttempts + 1;

    let correct = false;
    let feedbackText = '';

    try {
      if (currentQuestion.question_type === 'text') {
        setIsValidating(true);
        const validationResult = await validateAnswerExternal(currentQuestion.id, answerToSubmit);
        correct = validationResult.is_correct;
        feedbackText = validationResult.feedback_text;
      } else {
        // Use local validation for multiple choice and true/false questions
        correct = answerToSubmit === currentQuestion.correct_answer;
      }
    } catch (error) {
      console.error('External validation failed:', error);
      setApiError('Validierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      return;
    } finally {
      setIsValidating(false);
    }

    setIsCorrect(correct);
    
    setQuestionAttempts(prev => ({
      ...prev,
      [currentQuestion.id]: newAttempts
    }));

    const xpEarned = calculateXP(newAttempts, correct);
    const newFocusPoints = calculateNewFocusPoints(focusPoints, correct);
    const canProceed = shouldAllowProceed(correct, newAttempts);

    console.log('XP calculation:', { 
      questionId: currentQuestion.id,
      newAttempts, 
      correct, 
      xpEarned, 
      isFirstAttempt: newAttempts === 1,
      currentAttempts 
    });

    setCanProceed(canProceed);

    if (correct || newAttempts >= 3) {
      setShowResult(true);
      
      // Auto-progress for correct answers after 3 seconds
      if (correct) {
        const timer = setTimeout(() => {
          handleNextQuestion();
        }, 3000);
        setAutoProgressTimer(timer);
      }
    } else {
      setShowResult(false);
      setSelectedAnswer('');
      setTextAnswer('');
    }

    setFocusPoints(newFocusPoints);

    if (newFocusPoints > 0) {
      updateQuizAttemptMutation.mutate({
        focus_points: newFocusPoints
      });
    }
    
    try {
      await submitAnswerMutation.mutateAsync({
        questionId: currentQuestion.id,
        answer: answerToSubmit,
        correct,
        attemptCount: newAttempts,
        xpEarned
      });

      if (xpEarned > 0) {
        console.log('Checking for new achievements with XP:', xpEarned);
        await checkForNewAchievements(xpEarned);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }

    showAnswerFeedback(correct, newAttempts, xpEarned, currentQuestion, toast, feedbackText);
  };

  const handleNextQuestion = async () => {
    clearAutoProgressTimer();
    
    await queryClient.invalidateQueries({ queryKey: ['course-questions', courseId] });
    
    const updatedQuestions = queryClient.getQueryData(['course-questions', courseId]) as any[] || questions;
    
    if (currentQuestionIndex < updatedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setTextAnswer('');
      setShowResult(false);
      setCanProceed(false);
      setApiError(null);
      
      updateQuizAttemptMutation.mutate({
        current_question_index: nextIndex
      });
      
      const newProgress = Math.round(((nextIndex + 1) / updatedQuestions.length) * 100);
      updateProgressMutation.mutate(newProgress);
    } else {
      updateQuizAttemptMutation.mutate({
        is_completed: true,
        completed_at: new Date().toISOString()
      });
      
      updateProgressMutation.mutate(100);
      
      showQuizCompletionToast(toast);
    }
  };

  const handleRestart = () => {
    clearAutoProgressTimer();
    
    if (rest.quizAttempt?.id) {
      updateQuizAttemptMutation.mutate({
        current_question_index: 0,
        focus_points: 100,
        is_completed: false
      });
    }
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTextAnswer('');
    setShowResult(false);
    setFocusPoints(100);
    setQuestionAttempts({});
    setCanProceed(false);
    setApiError(null);
  };

  return {
    ...rest,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    textAnswer,
    focusPoints,
    questionAttempts,
    isValidating,
    apiError,
    toast,
    handleAnswerSelect,
    handleTextAnswerChange,
    handleSubmitAnswer,
    handleNextQuestion,
    handleRestart
  };
};
