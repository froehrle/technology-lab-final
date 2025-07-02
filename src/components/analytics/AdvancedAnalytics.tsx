import React from 'react';

interface AdvancedAnalyticsProps {
  completionRate: number;
  avgSessionDuration: number;
  avgAttemptsPerQuestion: number;
  difficultQuestionsCount: number;
}

const AdvancedAnalytics = ({ 
  completionRate, 
  avgSessionDuration, 
  avgAttemptsPerQuestion, 
  difficultQuestionsCount 
}: AdvancedAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Abschlussrate</p>
        <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Ø Session-Dauer</p>
        <p className="text-2xl font-bold text-blue-600">{avgSessionDuration.toFixed(1)} min</p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Ø Versuche pro Frage</p>
        <p className="text-2xl font-bold text-orange-600">{avgAttemptsPerQuestion.toFixed(1)}</p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Schwierigste Fragen</p>
        <p className="text-2xl font-bold text-red-600">{difficultQuestionsCount}</p>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;