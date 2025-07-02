
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, TrendingUp, Zap } from 'lucide-react';

interface DashboardStatsProps {
  enrollmentsCount: number;
  totalXP: number;
  averageProgress: number;
}

const DashboardStats = ({ enrollmentsCount, totalXP, averageProgress }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktive Kurse</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{enrollmentsCount}</div>
          <p className="text-xs text-muted-foreground">
            {enrollmentsCount === 0 ? 'Keine Kurse verfügbar' : 'eingeschriebene Kurse'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">XP Punkte</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {totalXP || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalXP ? 'Gesammeltes XP' : 'Beginnen Sie zu lernen!'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Serie</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0 Tage</div>
          <p className="text-xs text-muted-foreground">Starten Sie Ihre Serie!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {enrollmentsCount > 0 ? `${Math.round(averageProgress)}%` : '-'}
          </div>
          <p className="text-xs text-muted-foreground">Durchschnittlicher Fortschritt</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
