import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateQuestionDialog from '@/components/CreateQuestionDialog';
import EditQuestionDialog from '@/components/EditQuestionDialog';
import GenerateQuestionsDialog from '@/components/GenerateQuestionsDialog';
import CourseHeader from '@/components/CourseHeader';
import QuestionsList from '@/components/QuestionsList';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string | null;
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
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
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
          <CourseHeader 
            course={{ id: '', title: 'Kurs nicht gefunden', description: null, created_at: '', updated_at: '' }} 
            onCreateQuestion={() => {}} 
            onGenerateQuestions={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseHeader 
        course={course} 
        onCreateQuestion={() => setShowCreateDialog(true)} 
        onGenerateQuestions={() => setShowGenerateDialog(true)}
      />

      <QuestionsList
        questions={questions}
        onEditQuestion={handleEditQuestion}
        onDeleteQuestion={handleDeleteQuestion}
      />

      <CreateQuestionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        courseId={courseId!}
        onQuestionCreated={handleQuestionCreated}
      />

      <GenerateQuestionsDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        courseId={courseId!}
        onQuestionsGenerated={refetchQuestions}
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
