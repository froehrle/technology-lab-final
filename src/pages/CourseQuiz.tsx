
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import QuizInterface from '@/components/QuizInterface';

interface Course {
  id: string;
  title: string;
  description: string | null;
}

const CourseQuiz = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data as Course;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kurs nicht gefunden</h1>
          <Link to="/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu den Kursen
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-success/5 to-achievement/10">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <Link to="/courses">
            <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu den Kursen
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-achievement bg-clip-text text-transparent mb-2">{course.title}</h1>
          {course.description && (
            <p className="text-foreground/70 font-medium">{course.description}</p>
          )}
        </div>
        
        <QuizInterface courseId={courseId!} />
      </div>
    </div>
  );
};

export default CourseQuiz;
