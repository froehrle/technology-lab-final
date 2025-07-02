
import { useQuizState } from './useQuizState';
import { useAchievements } from './useAchievements';
import { calculateXP, calculateNewFocusPoints, shouldAllowProceed } from '@/utils/quizScoring';
import { showAnswerFeedback, showQuizCompletionToast } from '@/utils/quizFeedback';

export const useQuizActions = (courseId: string) => {
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
  };

  const handleTextAnswerChange = (answer: string) => {
    setTextAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answerToSubmit = currentQuestion?.question_type === 'text' ? textAnswer : selectedAnswer;
    if (!answerToSubmit || !currentQuestion) return;

    const correct = answerToSubmit === currentQuestion.correct_answer;
    const currentAttempts = questionAttempts[currentQuestion.id] || 0;
    const newAttempts = currentAttempts + 1;
    
    setIsCorrect(correct);
    
    setQuestionAttempts(prev => ({
      ...prev,
      [currentQuestion.id]: newAttempts
    }));

    // Calculate XP - only award XP for first correct attempt
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
    } else {
      setShowResult(false);
      setSelectedAnswer('');
      setTextAnswer('');
    }

    setFocusPoints(newFocusPoints);

    // Update quiz attempt without score
    updateQuizAttemptMutation.mutate({
      focus_points: newFocusPoints
    });
    
    // Submit answer with correct XP calculation
    try {
      await submitAnswerMutation.mutateAsync({
        questionId: currentQuestion.id,
        answer: answerToSubmit,
        correct,
        attemptCount: newAttempts,
        xpEarned
      });

      // Check for achievements only if XP was actually earned
      if (xpEarned > 0) {
        console.log('Checking for new achievements with XP:', xpEarned);
        await checkForNewAchievements(xpEarned);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }

    showAnswerFeedback(correct, newAttempts, xpEarned, currentQuestion, toast);
  };

  const handleNextQuestion = async () => {
    // Refetch questions to get the latest list in case new questions were added
    await queryClient.invalidateQueries({ queryKey: ['course-questions', courseId] });
    
    // Get the updated questions list
    const updatedQuestions = queryClient.getQueryData(['course-questions', courseId]) as any[] || questions;
    
    if (currentQuestionIndex < updatedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setTextAnswer('');
      setShowResult(false);
      setCanProceed(false);
      
      updateQuizAttemptMutation.mutate({
        current_question_index: nextIndex
      });
      
      // Use updated questions length for progress calculation
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
  };

  return {
    ...rest,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    textAnswer,
    focusPoints,
    questionAttempts,
    toast,
    handleAnswerSelect,
    handleTextAnswerChange,
    handleSubmitAnswer,
    handleNextQuestion,
    handleRestart
  };
};
