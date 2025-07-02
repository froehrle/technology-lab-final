
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
      <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Aktive Kurse</CardTitle>
          <BookOpen className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{enrollmentsCount}</div>
          <p className="text-xs text-primary/70 mt-1">
            {enrollmentsCount === 0 ? 'Keine Kurse verfügbar' : 'eingeschriebene Kurse'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-xp">XP Punkte</CardTitle>
          <Zap className="h-5 w-5 text-xp animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-xp">
            {totalXP || 0}
          </div>
          <p className="text-xs text-xp/70 mt-1">
            {totalXP ? 'Gesammeltes XP' : 'Beginnen Sie zu lernen!'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-warning">Serie</CardTitle>
          <Calendar className="h-5 w-5 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-warning">0 Tage</div>
          <p className="text-xs text-warning/70 mt-1">Starten Sie Ihre Serie!</p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-success">Fortschritt</CardTitle>
          <TrendingUp className="h-5 w-5 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success">
            {enrollmentsCount > 0 ? `${Math.round(averageProgress)}%` : '-'}
          </div>
          <p className="text-xs text-success/70 mt-1">Durchschnittlicher Fortschritt</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
