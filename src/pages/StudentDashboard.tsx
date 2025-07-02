
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Trophy, Calendar, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Willkommen zurück, {user?.user_metadata?.display_name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">Setzen Sie Ihre Lernreise fort</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Kurse</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Keine Kurse verfügbar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP Punkte</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Beginnen Sie zu lernen!</p>
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
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Noch keine Daten</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktuelle Kurse</CardTitle>
            <CardDescription>Machen Sie dort weiter, wo Sie aufgehört haben</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Noch keine Kurse vorhanden</p>
              <p className="text-sm text-gray-400 mt-2">Melden Sie sich für Ihren ersten Kurs an, um zu beginnen!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Erfolge</CardTitle>
            <CardDescription>Ihre neuesten Errungenschaften</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Noch keine Erfolge</p>
              <p className="text-sm text-gray-400 mt-2">Beginnen Sie zu lernen, um Erfolge zu erzielen!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
