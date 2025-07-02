
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface GameOverCardProps {
  onRestart: () => void;
}

const GameOverCard = ({ onRestart }: GameOverCardProps) => {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate('/courses');
  };

  const handleContinueQuiz = () => {
    onRestart();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600 text-center">Game Over</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Ihre Fokuspunkte sind auf 0 gefallen.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
            <h4 className="font-semibold text-blue-800 mb-2">Empfehlungen:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Machen Sie eine kurze Pause</li>
              <li>• Überprüfen Sie das Kursmaterial noch einmal</li>
              <li>• Kommen Sie ausgeruht zurück</li>
            </ul>
          </div>
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handleContinueQuiz}
            >
              Quiz fortsetzen
            </Button>
            <Button 
              variant="outline"
              className="w-full" 
              onClick={handleReturnToDashboard}
            >
              Zurück zum Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOverCard;
