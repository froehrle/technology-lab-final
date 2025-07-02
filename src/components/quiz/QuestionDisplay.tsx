
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
}

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string;
  textAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  attemptCount: number;
  isValidating?: boolean;
  apiError?: string | null;
  onAnswerSelect: (answer: string) => void;
  onTextAnswerChange: (answer: string) => void;
}

const QuestionDisplay = ({
  question,
  selectedAnswer,
  textAnswer,
  showResult,
  isCorrect,
  attemptCount,
  isValidating = false,
  apiError = null,
  onAnswerSelect,
  onTextAnswerChange
}: QuestionDisplayProps) => {
  const shouldShowFeedback = showResult && (isCorrect || attemptCount >= 3);

  const isMultipleChoice = question.question_type === 'multiple_choice';
  const isTrueFalse = question.question_type === 'true_false' || question.question_type === 'boolean';
  const isTextQuestion = question.question_type === 'text';

  const displayOptions = isTrueFalse ? [
    { label: 'Wahr', value: 'True' },
    { label: 'Falsch', value: 'False' }
  ] : question.options?.map(option => ({ label: option, value: option })) || [];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{question.question_text}</CardTitle>
          {attemptCount > 0 && (
            <div className="text-sm text-gray-500">
              Versuch {attemptCount}/3
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(isMultipleChoice || isTrueFalse) ? (
            displayOptions.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option.value ? "default" : "outline"}
                className={`w-full text-left justify-start h-auto p-4 ${
                  shouldShowFeedback
                    ? option.value === question.correct_answer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : selectedAnswer === option.value && !isCorrect
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : ''
                    : ''
                }`}
                onClick={() => onAnswerSelect(option.value)}
                disabled={shouldShowFeedback || isValidating}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium">
                    {isTrueFalse ? (option.value === 'True' ? 'W' : 'F') : String.fromCharCode(65 + index)}
                  </div>
                  <span>{option.label}</span>
                  {shouldShowFeedback && option.value === question.correct_answer && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                  {shouldShowFeedback && selectedAnswer === option.value && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                  )}
                </div>
              </Button>
            ))
          ) : isTextQuestion ? (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Geben Sie Ihre Antwort ein..."
                  value={textAnswer}
                  onChange={(e) => onTextAnswerChange(e.target.value)}
                  disabled={shouldShowFeedback || isValidating}
                  className={`text-lg p-4 ${
                    shouldShowFeedback
                      ? isCorrect
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : ''
                  }`}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              
              {apiError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {apiError}
                </div>
              )}
              
              {isValidating && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                  Antwort wird validiert...
                </div>
              )}
              
              {shouldShowFeedback && (
                <div className="text-sm text-gray-600">
                  {isCorrect ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Richtig!</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>Falsch!</span>
                      </div>
                      <p>Die richtige Antwort ist: <strong>{question.correct_answer}</strong></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
