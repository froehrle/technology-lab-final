
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
    score,
    questionAttempts,
    questions,
    setSelectedAnswer,
    setTextAnswer,
    setShowResult,
    setIsCorrect,
    setFocusPoints,
    setScore,
    setQuestionAttempts,
    setCanProceed,
    setCurrentQuestionIndex,
    updateQuizAttemptMutation,
    submitAnswerMutation,
    updateProgressMutation,
    toast,
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
    const newScore = correct ? score + (currentQuestion.points || 1) + xpEarned : score;
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
    setScore(newScore);

    // Update quiz attempt
    updateQuizAttemptMutation.mutate({
      current_score: newScore,
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setTextAnswer('');
      setShowResult(false);
      setCanProceed(false);
      
      updateQuizAttemptMutation.mutate({
        current_question_index: nextIndex
      });
      
      const newProgress = Math.round(((nextIndex + 1) / questions.length) * 100);
      updateProgressMutation.mutate(newProgress);
    } else {
      updateQuizAttemptMutation.mutate({
        is_completed: true,
        completed_at: new Date().toISOString()
      });
      
      updateProgressMutation.mutate(100);
      
      showQuizCompletionToast(score, toast);
    }
  };

  const handleRestart = () => {
    if (rest.quizAttempt?.id) {
      updateQuizAttemptMutation.mutate({
        current_question_index: 0,
        focus_points: 100,
        current_score: 0,
        is_completed: false
      });
    }
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTextAnswer('');
    setShowResult(false);
    setFocusPoints(100);
    setScore(0);
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
    score,
    questionAttempts,
    toast,
    handleAnswerSelect,
    handleTextAnswerChange,
    handleSubmitAnswer,
    handleNextQuestion,
    handleRestart
  };
};
