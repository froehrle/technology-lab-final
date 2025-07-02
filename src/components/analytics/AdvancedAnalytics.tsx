import React from 'react';

interface AdvancedAnalyticsProps {
  completionRate: number;
  avgSessionDuration: number;
}

const AdvancedAnalytics = ({ 
  completionRate, 
  avgSessionDuration
}: AdvancedAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Abschlussrate</p>
        <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Ø Session-Dauer</p>
        <p className="text-2xl font-bold text-blue-600">{avgSessionDuration.toFixed(1)} min</p>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;