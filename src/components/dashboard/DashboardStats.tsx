
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
      <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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

      <Card className="border-0 bg-gradient-to-br from-xp/20 to-xp/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-xp-foreground">XP Punkte</CardTitle>
          <Zap className="h-5 w-5 text-xp animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-xp-foreground">
            {totalXP || 0}
          </div>
          <p className="text-xs text-xp-foreground/70 mt-1">
            {totalXP ? 'Gesammeltes XP' : 'Beginnen Sie zu lernen!'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-warning/20 to-warning/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-warning-foreground">Serie</CardTitle>
          <Calendar className="h-5 w-5 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-warning-foreground">0 Tage</div>
          <p className="text-xs text-warning-foreground/70 mt-1">Starten Sie Ihre Serie!</p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-success/20 to-success/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-success-foreground">Fortschritt</CardTitle>
          <TrendingUp className="h-5 w-5 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success-foreground">
            {enrollmentsCount > 0 ? `${Math.round(averageProgress)}%` : '-'}
          </div>
          <p className="text-xs text-success-foreground/70 mt-1">Durchschnittlicher Fortschritt</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
