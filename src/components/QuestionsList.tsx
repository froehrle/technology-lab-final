
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionCard from './QuestionCard';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string | null;
  points: number | null;
  created_at: string;
  updated_at: string;
}

interface QuestionsListProps {
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const QuestionsList = ({ questions, onEditQuestion, onDeleteQuestion }: QuestionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fragen ({questions.length})</CardTitle>
        <CardDescription>
          Verwalten Sie die Fragen für diesen Kurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Noch keine Fragen erstellt</p>
            <p className="text-sm text-gray-400 mt-2">
              Fügen Sie Ihre erste Frage hinzu, um zu beginnen!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onEdit={onEditQuestion}
                onDelete={onDeleteQuestion}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionsList;
