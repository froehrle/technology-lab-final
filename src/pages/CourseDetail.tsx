
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateQuestionDialog from '@/components/CreateQuestionDialog';
import EditQuestionDialog from '@/components/EditQuestionDialog';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string | null;
  points: number | null;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('teacher_id', user?.id)
        .single();

      if (error) throw error;
      return data as Course;
    },
    enabled: !!courseId && !!user?.id,
  });

  const { data: questions = [], refetch: refetchQuestions } = useQuery({
    queryKey: ['questions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
    enabled: !!courseId,
  });

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Frage gelöscht",
        description: "Die Frage wurde erfolgreich gelöscht.",
      });

      refetchQuestions();
    } catch (error) {
      console.error('Fehler beim Löschen der Frage:', error);
      toast({
        title: "Fehler",
        description: "Die Frage konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleQuestionCreated = () => {
    refetchQuestions();
    setShowCreateDialog(false);
  };

  const handleQuestionUpdated = () => {
    refetchQuestions();
    setShowEditDialog(false);
    setSelectedQuestion(null);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setShowEditDialog(true);
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kurs nicht gefunden</h1>
          <Link to="/teacher-dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/teacher-dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Dashboard
          </Button>
        </Link>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            {course.description && (
              <p className="text-gray-600 mt-2">{course.description}</p>
            )}
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Frage hinzufügen
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fragen ({questions.length})</CardTitle>
          <CardDescription>
            Verwalten Sie die Fragen für diesen Kurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Noch keine Fragen erstellt</p>
              <p className="text-sm text-gray-400 mt-2">
                Fügen Sie Ihre erste Frage hinzu, um zu beginnen!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Frage {index + 1}
                        </CardTitle>
                        <CardDescription className="mt-2 text-base">
                          {question.question_text}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">Typ:</span> {question.question_type}
                      </div>
                      <div>
                        <span className="font-medium">Erstellt:</span>{' '}
                        {new Date(question.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                    {question.options && (
                      <div className="mt-4">
                        <span className="font-medium text-sm">Antwortmöglichkeiten:</span>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                          {Array.isArray(question.options) 
                            ? question.options.map((option: string, idx: number) => (
                                <li key={idx} className={option === question.correct_answer ? 'text-green-600 font-medium bg-green-50 p-2 rounded' : 'p-2'}>
                                  {option} {option === question.correct_answer && '✓ (Richtige Antwort)'}
                                </li>
                              ))
                            : Object.entries(question.options).map(([key, value]) => (
                                <li key={key} className={value === question.correct_answer ? 'text-green-600 font-medium bg-green-50 p-2 rounded' : 'p-2'}>
                                  {value as string} {value === question.correct_answer && '✓ (Richtige Antwort)'}
                                </li>
                              ))
                          }
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateQuestionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        courseId={courseId!}
        onQuestionCreated={handleQuestionCreated}
      />

      {selectedQuestion && (
        <EditQuestionDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          question={selectedQuestion}
          onQuestionUpdated={handleQuestionUpdated}
        />
      )}
    </div>
  );
};

export default CourseDetail;
