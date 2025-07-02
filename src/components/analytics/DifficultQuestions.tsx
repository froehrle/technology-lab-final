import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface DifficultQuestionsProps {
  difficultQuestions: any[];
}

const DifficultQuestions = ({ difficultQuestions }: DifficultQuestionsProps) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Schwierigste Fragen</h3>
      </div>
      
      {difficultQuestions.length > 0 ? (
        <div className="space-y-3">
          {difficultQuestions.map((question: any, index: number) => (
            <div 
              key={question.questionId} 
              className="p-4 border rounded-lg animate-fade-in hover-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Badge variant="secondary">{question.courseTitle}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">
                    {question.questionText.length > 100 
                      ? `${question.questionText.substring(0, 100)}...` 
                      : question.questionText}
                  </p>
                  <div className="flex space-x-4 text-xs text-muted-foreground">
                    <span>Falsche Antworten: {question.wrongPercentage.toFixed(1)}%</span>
                    <span>Ø Versuche: {question.avgAttempts.toFixed(1)}</span>
                    <span>Gesamt Antworten: {question.totalAnswers}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Noch keine Daten zu schwierigen Fragen verfügbar.</p>
      )}
    </div>
  );
};

export default DifficultQuestions;