import React from 'react';
import { Users, Target, CheckCircle } from 'lucide-react';

interface OverviewStatsProps {
  totalEnrollments: number;
  totalQuizAttempts: number;
  perfectCompletions: number;
}

const OverviewStats = ({ totalEnrollments, totalQuizAttempts, perfectCompletions }: OverviewStatsProps) => {
  const formatNumber = (num: number) => {
    return num?.toString() || '0';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Eingeschriebene Studenten</p>
          <p className="text-2xl font-bold">{formatNumber(totalEnrollments)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
          <Target className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Quiz-Versuche</p>
          <p className="text-2xl font-bold">{formatNumber(totalQuizAttempts)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Perfekte Abschlüsse</p>
          <p className="text-2xl font-bold">{formatNumber(perfectCompletions)}</p>
          <p className="text-xs text-muted-foreground">
            {perfectCompletions === 0 && totalEnrollments > 0 
              ? "Noch keine perfekten Abschlüsse" 
              : perfectCompletions === 0 && totalEnrollments === 0
              ? "Keine Daten verfügbar"
              : "Alle Fragen korrekt beantwortet"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewStats;