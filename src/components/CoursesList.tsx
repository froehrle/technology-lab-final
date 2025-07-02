
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import EditCourseDialog from './EditCourseDialog';

interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CoursesListProps {
  courses: Course[];
  onCourseUpdated: () => void;
}

const CoursesList: React.FC<CoursesListProps> = ({ courses, onCourseUpdated }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditCourse = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setEditingCourse(course);
    setShowEditDialog(true);
  };

  const handleDeleteCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    if (!confirm('Sind Sie sicher, dass Sie diesen Kurs löschen möchten?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Kurs gelöscht",
        description: "Der Kurs wurde erfolgreich gelöscht.",
      });

      onCourseUpdated();
    } catch (error) {
      console.error('Fehler beim Löschen des Kurses:', error);
      toast({
        title: "Fehler",
        description: "Der Kurs konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Noch keine Kurse erstellt</p>
        <p className="text-sm text-gray-400 mt-2">Erstellen Sie Ihren ersten Kurs, um zu beginnen!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Erstellt: {new Date(course.created_at).toLocaleDateString('de-DE')}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => handleEditCourse(e, course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => handleDeleteCourse(e, course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditCourseDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        course={editingCourse}
        onCourseUpdated={onCourseUpdated}
      />
    </>
  );
};

export default CoursesList;
