import React from 'react';

interface AdvancedAnalyticsProps {
  completionRate: number;
  avgSessionDuration: number;
}

const AdvancedAnalytics = ({ 
  completionRate, 
  avgSessionDuration
}: AdvancedAnalyticsProps) => {
  const formatDuration = (minutes: number) => {
    if (minutes === 0) return "Keine Daten";
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const formatCompletionRate = (rate: number) => {
    if (rate === 0) return "0%";
    return `${Math.round(rate)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Abschlussrate</p>
        <p className="text-2xl font-bold text-green-600">{formatCompletionRate(completionRate)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {completionRate === 0 
            ? "Noch keine abgeschlossenen Kurse" 
            : "der Schüler haben ihre Kurse abgeschlossen"
          }
        </p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Ø Session-Dauer</p>
        <p className="text-2xl font-bold text-blue-600">{formatDuration(avgSessionDuration)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {avgSessionDuration === 0 
            ? "Noch keine Quiz-Sessions verfügbar" 
            : "Durchschnittliche Zeit pro Quiz-Session"
          }
        </p>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;