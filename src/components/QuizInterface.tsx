
import React, { useEffect } from 'react';
import { useQuizActions } from '@/hooks/useQuizActions';
import QuizProgressHeader from './quiz/QuizProgressHeader';
import QuestionDisplay from './quiz/QuestionDisplay';
import QuizActions from './quiz/QuizActions';
import GameOverCard from './quiz/GameOverCard';
import NoQuestionsCard from './quiz/NoQuestionsCard';
import QuizCompletedCard from './quiz/QuizCompletedCard';

interface QuizInterfaceProps {
  courseId: string;
}

const QuizInterface = ({ courseId }: QuizInterfaceProps) => {
  const {
    questions,
    questionsLoading,
    attemptLoading,
    quizAttempt,
    currentQuestionIndex,
    selectedAnswer,
    textAnswer,
    showResult,
    isCorrect,
    focusPoints,
    questionAttempts,
    canProceed,
    isValidating,
    apiError,
    handleAnswerSelect,
    handleTextAnswerChange,
    handleSubmitAnswer,
    handleNextQuestion,
    handleRestart,
    toast
  } = useQuizActions(courseId);

  useEffect(() => {
    if (focusPoints <= 20 && focusPoints > 0) {
      toast({
        title: "Fokus niedrig",
        description: "Ihre Fokuspunkte sind niedrig. Eine Pause wird empfohlen.",
        variant: "destructive"
      });
    }
  }, [focusPoints, toast]);

  if (questionsLoading || attemptLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (focusPoints <= 0) {
    return <GameOverCard onRestart={handleRestart} />;
  }

  if (!questions.length) {
    return <NoQuestionsCard />;
  }

  if (quizAttempt?.is_completed) {
    return <QuizCompletedCard onRestart={handleRestart} />;
  }

  const adjustedQuestionIndex = Math.min(currentQuestionIndex, questions.length - 1);
  const currentQuestion = questions[adjustedQuestionIndex];
  
  const progress = questions.length > 0 ? ((adjustedQuestionIndex + 1) / questions.length) * 100 : 0;
  const hasAnswer = currentQuestion?.question_type === 'multiple_choice' ? !!selectedAnswer : !!textAnswer;
  const currentAttempts = questionAttempts[currentQuestion?.id] || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <QuizProgressHeader
        focusPoints={focusPoints}
        progress={progress}
        currentQuestionIndex={adjustedQuestionIndex}
        totalQuestions={questions.length}
      />

      <QuestionDisplay
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        textAnswer={textAnswer}
        showResult={showResult}
        isCorrect={isCorrect}
        attemptCount={currentAttempts}
        isValidating={isValidating}
        apiError={apiError}
        onAnswerSelect={handleAnswerSelect}
        onTextAnswerChange={handleTextAnswerChange}
      />

      <QuizActions
        showResult={showResult}
        hasAnswer={hasAnswer}
        currentQuestionIndex={adjustedQuestionIndex}
        totalQuestions={questions.length}
        canProceed={canProceed}
        isValidating={isValidating}
        onSubmitAnswer={handleSubmitAnswer}
        onNextQuestion={handleNextQuestion}
      />
    </div>
  );
};

export default QuizInterface;
