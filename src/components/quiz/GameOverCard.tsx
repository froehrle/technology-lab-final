
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GameOverCardProps {
  onRestart: () => void;
}

const GameOverCard = ({ onRestart }: GameOverCardProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Game Over</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Sie haben alle Leben verloren!</p>
          <Button 
            className="w-full mt-4" 
            onClick={onRestart}
          >
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOverCard;
