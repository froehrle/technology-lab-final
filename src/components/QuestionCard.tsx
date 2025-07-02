
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string | null;
  created_at: string;
  updated_at: string;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
}

const QuestionCard = ({ question, index, onEdit, onDelete }: QuestionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {question.question_text}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Richtige Antwort: {question.correct_answer || 'Nicht festgelegt'}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(question)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(question.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="font-medium">Typ:</span> {question.question_type}
          </div>
          <div>
            <span className="font-medium">Erstellt:</span>{' '}
            {new Date(question.created_at).toLocaleDateString('de-DE')}
          </div>
        </div>
        {question.options && (
          <div className="mt-4">
            <span className="font-medium text-sm">Antwortmöglichkeiten:</span>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              {Array.isArray(question.options) 
                ? question.options.map((option: string, idx: number) => (
                    <li key={idx} className={option === question.correct_answer ? 'text-green-600 font-medium bg-green-50 p-2 rounded' : 'p-2'}>
                      {option} {option === question.correct_answer && '✓ (Richtige Antwort)'}
                    </li>
                  ))
                : Object.entries(question.options).map(([key, value]) => (
                    <li key={key} className={value === question.correct_answer ? 'text-green-600 font-medium bg-green-50 p-2 rounded' : 'p-2'}>
                      {value as string} {value === question.correct_answer && '✓ (Richtige Antwort)'}
                    </li>
                  ))
              }
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
