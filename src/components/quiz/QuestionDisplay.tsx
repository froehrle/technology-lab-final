
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  question_style?: string;
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
  feedbackText?: string;
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
  feedbackText = '',
  onAnswerSelect,
  onTextAnswerChange
}: QuestionDisplayProps) => {
  const shouldShowFeedback = showResult && !!feedbackText;

  const isMultipleChoice = question.question_type === 'multiple_choice';
  const isTextQuestion = question.question_type === 'text';

  // Parse options from raw data
  let options: string[] = [];
  if (Array.isArray(question.options)) {
    options = question.options;
  } else if (typeof question.options === 'string') {
    try {
      const parsed = JSON.parse(question.options);
      options = Array.isArray(parsed) ? parsed : [];
    } catch {
      options = [];
    }
  } else if (question.options && typeof question.options === 'object') {
    options = Object.values(question.options) as string[];
  }

  const displayOptions = options.map(option => ({ 
    label: option, 
    value: option
  }));

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
          {isMultipleChoice ? (
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
                      {String.fromCharCode(65 + index)}
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Richtig!</span>
                      </div>
                      {feedbackText && (
                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <p className="text-green-800">{feedbackText}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>Falsch!</span>
                      </div>
                      <p>Die richtige Antwort ist: <strong>{question.correct_answer}</strong></p>
                      {feedbackText && (
                        <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                          <p className="text-red-800">{feedbackText}</p>
                        </div>
                      )}
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
