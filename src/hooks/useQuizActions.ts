
import { useQuizState } from './useQuizState';

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
    queryClient,
    ...rest
  } = useQuizState(courseId);

  const handleAnswerSelect = (answer: string) => {
    if (rest.showResult && rest.canProceed) return;
    setSelectedAnswer(answer);
  };

  const handleTextAnswerChange = (answer: string) => {
    setTextAnswer(answer);
  };

  const calculateXP = (attemptCount: number, correct: boolean): number => {
    if (!correct) return 0;
    
    switch (attemptCount) {
      case 1: return 20;
      case 2: return 10;
      default: return 0;
    }
  };

  const checkForNewAchievements = async (xpEarned: number) => {
    if (xpEarned <= 0) return;

    // Invalidate achievements queries to refetch them
    queryClient.invalidateQueries({ queryKey: ['student-achievements'] });
    queryClient.invalidateQueries({ queryKey: ['student-xp'] });
  };

  const handleSubmitAnswer = () => {
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

    const xpEarned = calculateXP(newAttempts, correct);
    let newFocusPoints = focusPoints;
    let newScore = score;

    if (correct) {
      newFocusPoints = Math.min(100, focusPoints + 5);
      newScore = score + (currentQuestion.points || 1) + xpEarned;
      setCanProceed(true);
    } else {
      newFocusPoints = Math.max(0, focusPoints - 10);
      if (newAttempts < 3) {
        setCanProceed(false);
      } else {
        setCanProceed(true);
      }
    }

    if (correct || newAttempts >= 3) {
      setShowResult(true);
    } else {
      setShowResult(false);
      setSelectedAnswer('');
      setTextAnswer('');
    }

    setFocusPoints(newFocusPoints);
    setScore(newScore);

    updateQuizAttemptMutation.mutate({
      current_score: newScore,
      focus_points: newFocusPoints
    });
    
    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      answer: answerToSubmit,
      correct,
      attemptCount: newAttempts,
      xpEarned
    }, {
      onSuccess: () => {
        // Check for new achievements after successful answer submission
        checkForNewAchievements(xpEarned);
      }
    });

    // Show feedback
    if (correct) {
      if (xpEarned > 0) {
        toast({
          title: `+${xpEarned} XP!`,
          description: `${newAttempts === 1 ? 'Perfekt beim ersten Versuch!' : 'Richtig beim zweiten Versuch!'}`,
        });
      } else if (newAttempts >= 3) {
        toast({
          title: "Richtig!",
          description: "Kein XP nach dem 3. Versuch, aber weiter so!",
        });
      }
    } else {
      if (newAttempts < 3) {
        toast({
          title: "Noch nicht richtig",
          description: `Versuch ${newAttempts} von 3. Versuchen Sie es erneut!`,
          variant: "default"
        });
      } else {
        toast({
          title: "Falsch",
          description: `Die richtige Antwort ist: ${currentQuestion.correct_answer}`,
          variant: "destructive"
        });
      }
    }
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
      
      toast({
        title: "Quiz abgeschlossen!",
        description: `Glückwunsch! Sie haben ${score} Punkte erreicht.`,
      });
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
