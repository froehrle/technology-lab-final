
import { useQuizState } from './useQuizState';
import { useAchievements } from './useAchievements';
import { useAnswerValidation } from './useAnswerValidation';
import { useQuizNavigation } from './useQuizNavigation';
import { useQuizTimer } from './useQuizTimer';
import { calculateXP, calculateNewFocusPoints, shouldAllowProceed } from '@/utils/quizScoring';
import { showAnswerFeedback } from '@/utils/quizFeedback';

export const useQuizActions = (courseId: string) => {
  const { clearAutoProgressTimer, setAutoProgressWithDelay } = useQuizTimer();
  const { isValidating, apiError, validateAnswer, clearApiError } = useAnswerValidation();

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

  const { handleNextQuestion: navigateToNext, handleRestart: restartQuiz } = useQuizNavigation({
    courseId,
    currentQuestionIndex,
    questions,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setTextAnswer,
    setShowResult,
    setCanProceed,
    updateQuizAttemptMutation,
    updateProgressMutation,
    toast,
    clearApiError
  });

  const handleAnswerSelect = (answer: string) => {
    if (rest.showResult && rest.canProceed) return;
    setSelectedAnswer(answer);
    clearApiError();
  };

  const handleTextAnswerChange = (answer: string) => {
    setTextAnswer(answer);
    clearApiError();
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answerToSubmit = currentQuestion?.question_type === 'text' ? textAnswer : selectedAnswer;
    if (!answerToSubmit || !currentQuestion) return;

    clearAutoProgressTimer();

    const currentAttempts = questionAttempts[currentQuestion.id] || 0;
    const newAttempts = currentAttempts + 1;

    let correct = false;
    let feedbackText = '';

    try {
      const validationResult = await validateAnswer(currentQuestion, answerToSubmit);
      correct = validationResult.correct;
      feedbackText = validationResult.feedbackText;
    } catch (error) {
      return;
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
        setAutoProgressWithDelay(() => {
          handleNextQuestion();
        });
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
    await navigateToNext();
  };

  const handleRestart = () => {
    clearAutoProgressTimer();
    setFocusPoints(100);
    setQuestionAttempts({});
    restartQuiz();
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
