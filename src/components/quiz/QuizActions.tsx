
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuizActionsProps {
  showResult: boolean;
  hasAnswer: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  canProceed: boolean;
  isValidating?: boolean;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

const QuizActions = ({
  showResult,
  hasAnswer,
  currentQuestionIndex,
  totalQuestions,
  canProceed,
  isValidating = false,
  onSubmitAnswer,
  onNextQuestion
}: QuizActionsProps) => {
  return (
    <div className="flex gap-4">
      {!showResult || !canProceed ? (
        <Button 
          onClick={onSubmitAnswer} 
          disabled={!hasAnswer || isValidating}
          className="flex-1"
          size="lg"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Validierung...
            </>
          ) : (
            'Antwort bestätigen'
          )}
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
