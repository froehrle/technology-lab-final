
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle } from 'lucide-react';

interface QuizCompletedCardProps {
  score: number;
  onRestart: () => void;
}

const QuizCompletedCard = ({ score, onRestart }: QuizCompletedCardProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <CheckCircle className="h-8 w-8 text-green-600 absolute -top-2 -right-2 bg-white rounded-full" />
            </div>
          </div>
          <CardTitle className="text-green-700 text-2xl">Quiz Abgeschlossen!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-green-600 mb-4 text-lg">
            Herzlichen Glückwunsch! Sie haben das Quiz bereits erfolgreich abgeschlossen.
          </p>
          <div className="bg-green-100 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">Ihre Endpunktzahl: {score}</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Jedes Quiz kann nur einmal durchgeführt werden. Wenn Sie es erneut versuchen möchten, wird Ihr Fortschritt zurückgesetzt.
          </p>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={onRestart}
          >
            Quiz erneut starten
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCompletedCard;
