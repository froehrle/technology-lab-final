import React from 'react';
import { Trophy } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface LeaderboardHeaderProps {
  userRole: string | null;
}

export const LeaderboardHeader = ({ userRole }: LeaderboardHeaderProps) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">XP Rangliste</h1>
        <p className="text-gray-600 mt-2">
          {userRole === 'teacher' 
            ? 'Anonymisierte Übersicht der Klassenleistung basierend auf XP-Punkten' 
            : 'Siehe wie du im Vergleich zu anderen Studenten abschneidest'
          }
        </p>
      </div>

      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Top Studenten</span>
        </CardTitle>
        <CardDescription>
          Basierend auf gesammelten XP-Punkten aus Quiz-Aktivitäten
        </CardDescription>
      </CardHeader>
    </>
  );
};