
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
}

const StudentCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!user?.id,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert([
          {
            student_id: user!.id,
            course_id: courseId,
            progress: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
      toast({
        title: "Erfolgreich eingeschrieben",
        description: "Sie wurden erfolgreich für den Kurs eingeschrieben!",
      });
    },
    onError: (error) => {
      console.error('Enrollment error:', error);
      toast({
        title: "Fehler",
        description: "Die Einschreibung konnte nicht abgeschlossen werden.",
        variant: "destructive",
      });
    }
  });

  const handleEnrollCourse = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  const handleStartCourse = (courseId: string) => {
    navigate(`/course/${courseId}/quiz`);
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.progress || 0;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meine Kurse</h1>
          <p className="text-gray-600 mt-2">Setzen Sie Ihre Lernreise fort</p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Kurse werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meine Kurse</h1>
          <p className="text-gray-600 mt-2">Setzen Sie Ihre Lernreise fort</p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">Fehler beim Laden der Kurse</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verfügbare Kurse</h1>
        <p className="text-gray-600 mt-2">Wählen Sie einen Kurs aus, um zu beginnen</p>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Noch keine Kurse verfügbar</CardTitle>
              <CardDescription>
                Es sind noch keine Kurse verfügbar. Schauen Sie später wieder vorbei oder kontaktieren Sie Ihren Lehrer.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const progress = getEnrollmentProgress(course.id);
            
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {course.title}
                  </CardTitle>
                  {course.description && (
                    <CardDescription>{course.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Erstellt: {new Date(course.created_at).toLocaleDateString('de-DE')}
                    </p>
                    
                    {enrolled && progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {enrolled ? (
                        <Button 
                          onClick={() => handleStartCourse(course.id)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {progress > 0 ? 'Fortsetzen' : 'Starten'}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleEnrollCourse(course.id)}
                          variant="outline"
                          className="flex-1"
                          disabled={enrollMutation.isPending}
                        >
                          {enrollMutation.isPending ? 'Wird eingeschrieben...' : 'Kurs beitreten'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
