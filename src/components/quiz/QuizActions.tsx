
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizActionsProps {
  showResult: boolean;
  hasAnswer: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

const QuizActions = ({
  showResult,
  hasAnswer,
  currentQuestionIndex,
  totalQuestions,
  onSubmitAnswer,
  onNextQuestion
}: QuizActionsProps) => {
  return (
    <div className="flex gap-4">
      {!showResult ? (
        <Button 
          onClick={onSubmitAnswer} 
          disabled={!hasAnswer}
          className="flex-1"
          size="lg"
        >
          Antwort bestätigen
        </Button>
      ) : (
        <Button 
          onClick={onNextQuestion} 
          className="flex-1"
          size="lg"
        >
          {currentQuestionIndex < totalQuestions - 1 ? 'Weiter' : 'Quiz beenden'}
        </Button>
      )}
    </div>
  );
};

export default QuizActions;
