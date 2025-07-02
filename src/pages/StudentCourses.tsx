
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const StudentCourses = () => {
  const navigate = useNavigate();

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

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
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
          {courses.map((course) => (
            <Card 
              key={course.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCourseClick(course.id)}
            >
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
                <p className="text-sm text-gray-500">
                  Erstellt: {new Date(course.created_at).toLocaleDateString('de-DE')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
