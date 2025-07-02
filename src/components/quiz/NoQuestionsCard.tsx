
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NoQuestionsCard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Keine Fragen verfügbar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Für diesen Kurs sind noch keine Fragen verfügbar.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoQuestionsCard;
