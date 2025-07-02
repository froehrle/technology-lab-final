
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Calendar, TrendingUp, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CourseEnrollment {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    description: string | null;
  };
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['student-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!user?.id,
  });

  const handleContinueCourse = (courseId: string) => {
    navigate(`/course/${courseId}/quiz`);
  };

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
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              {enrollments.length === 0 ? 'Keine Kurse verfügbar' : 'eingeschriebene Kurse'}
            </p>
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
            <div className="text-2xl font-bold">
              {enrollments.length > 0 
                ? `${Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)}%`
                : '-'
              }
            </div>
            <p className="text-xs text-muted-foreground">Durchschnittlicher Fortschritt</p>
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
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Kurse werden geladen...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Noch keine Kurse vorhanden</p>
                <p className="text-sm text-gray-400 mt-2">Melden Sie sich für Ihren ersten Kurs an, um zu beginnen!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div 
                    key={enrollment.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{enrollment.courses.title}</h3>
                      {enrollment.courses.description && (
                        <p className="text-sm text-gray-600 mt-1">{enrollment.courses.description}</p>
                      )}
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{enrollment.progress}% abgeschlossen</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleContinueCourse(enrollment.course_id)}
                      size="sm"
                      className="ml-4"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {enrollment.progress > 0 ? 'Fortsetzen' : 'Starten'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
