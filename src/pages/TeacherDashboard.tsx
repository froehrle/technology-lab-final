
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, GraduationCap, Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import CoursesList from '@/components/CoursesList';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: courses = [], refetch: refetchCourses } = useQuery({
    queryKey: ['teacher-courses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, created_at, updated_at, teacher_id')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch total students enrolled in teacher's courses
  const { data: totalStudents = 0 } = useQuery({
    queryKey: ['teacher-students', user?.id],
    queryFn: async () => {
      if (!user?.id || courses.length === 0) return 0;
      
      const courseIds = courses.map(course => course.id);
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('student_id')
        .in('course_id', courseIds);

      if (error) throw error;
      
      // Count unique students
      const uniqueStudents = new Set(data?.map(enrollment => enrollment.student_id) || []);
      return uniqueStudents.size;
    },
    enabled: !!user?.id && courses.length > 0,
  });

  // Fetch completed courses (Abschlüsse)
  const { data: completedCourses = 0 } = useQuery({
    queryKey: ['teacher-completions', user?.id],
    queryFn: async () => {
      if (!user?.id || courses.length === 0) return 0;
      
      const courseIds = courses.map(course => course.id);
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .in('course_id', courseIds)
        .not('completed_at', 'is', null);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id && courses.length > 0,
  });

  // Fetch recent activity (recent quiz attempts in last 7 days)
  const { data: recentActivity = 0 } = useQuery({
    queryKey: ['teacher-activity', user?.id],
    queryFn: async () => {
      if (!user?.id || courses.length === 0) return 0;
      
      const courseIds = courses.map(course => course.id);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id')
        .in('course_id', courseIds)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id && courses.length > 0,
  });

  const handleCourseCreated = () => {
    refetchCourses();
    setShowCreateDialog(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Willkommen zurück, {user?.user_metadata?.display_name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">Verwalten Sie Ihre Kurse und Schüler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meine Kurse</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.length === 1 ? 'Aktiver Kurs' : 'Aktive Kurse'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schüler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents === 1 ? 'Eingeschriebener Schüler' : 'Eingeschriebene Schüler'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abschlüsse</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {completedCourses === 1 ? 'Abgeschlossener Kurs' : 'Abgeschlossene Kurse'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivität</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Quiz-Versuche (7 Tage)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Meine Kurse</CardTitle>
              <CardDescription>Verwalten Sie Ihre erstellten Kurse</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neuen Kurs erstellen
            </Button>
          </CardHeader>
          <CardContent>
            <CoursesList courses={courses} onCourseUpdated={refetchCourses} />
          </CardContent>
        </Card>
      </div>


      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
};

export default TeacherDashboard;
