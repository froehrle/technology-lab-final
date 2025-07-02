
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
}

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string;
  textAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  attemptCount: number;
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
  onAnswerSelect,
  onTextAnswerChange
}: QuestionDisplayProps) => {
  const shouldShowFeedback = showResult && (isCorrect || attemptCount >= 3);

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
          {question.question_type === 'multiple_choice' ? (
            question.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className={`w-full text-left justify-start h-auto p-4 ${
                  shouldShowFeedback
                    ? option === question.correct_answer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : selectedAnswer === option && !isCorrect
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : ''
                    : ''
                }`}
                onClick={() => onAnswerSelect(option)}
                disabled={shouldShowFeedback}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                  {shouldShowFeedback && option === question.correct_answer && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                  {shouldShowFeedback && selectedAnswer === option && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                  )}
                </div>
              </Button>
            ))
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Geben Sie Ihre Antwort ein..."
                value={textAnswer}
                onChange={(e) => onTextAnswerChange(e.target.value)}
                disabled={shouldShowFeedback}
                className={`text-lg p-4 ${
                  shouldShowFeedback
                    ? isCorrect
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : ''
                }`}
              />
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
