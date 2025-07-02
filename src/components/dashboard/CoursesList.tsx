
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, CheckCircle, XCircle } from 'lucide-react';
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

interface CourseStats {
  course_id: string;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
}

interface CoursesListProps {
  enrollments: CourseEnrollment[];
  courseStats: CourseStats[];
  isLoading: boolean;
}

const CoursesList = ({ enrollments, courseStats, isLoading }: CoursesListProps) => {
  const navigate = useNavigate();

  const handleContinueCourse = (courseId: string) => {
    navigate(`/course/${courseId}/quiz`);
  };

  const getCourseStats = (courseId: string) => {
    return courseStats.find(stat => stat.course_id === courseId) || {
      course_id: courseId,
      correct_answers: 0,
      wrong_answers: 0,
      total_questions: 0
    };
  };

  return (
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
            {enrollments.map((enrollment) => {
              const stats = getCourseStats(enrollment.course_id);
              return (
                <div 
                  key={enrollment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{enrollment.courses.title}</h3>
                    {enrollment.courses.description && (
                      <p className="text-sm text-gray-600 mt-1">{enrollment.courses.description}</p>
                    )}
                    
                    {/* Question Statistics */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">{stats.correct_answers}</span>
                        <span className="text-gray-500">richtig</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-700 font-medium">{stats.wrong_answers}</span>
                        <span className="text-gray-500">falsch</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        von {stats.total_questions} Fragen
                      </div>
                    </div>

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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursesList;
