import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
}

interface QuizAttempt {
  id: string;
  current_question_index: number;
  focus_points: number;
  current_score: number;
  is_completed: boolean;
  completed_at?: string;
}

export const useQuizData = (courseId: string) => {
  const { user } = useAuth();

  // Fetch questions with shorter refetch interval to catch new questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['course-questions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Question[];
    },
    enabled: !!courseId,
    refetchInterval: 10000, // Refetch every 10 seconds to catch new questions
    refetchIntervalInBackground: true,
  });

  // Fetch or create quiz attempt
  const { data: quizAttempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['quiz-attempt', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: existingAttempt, error: fetchError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingAttempt) {
        return existingAttempt as QuizAttempt;
      }

      const { data: newAttempt, error: createError } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            student_id: user.id,
            course_id: courseId,
            current_question_index: 0,
            focus_points: 100,
            current_score: 0,
            is_completed: false
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      return newAttempt as QuizAttempt;
    },
    enabled: !!courseId && !!user?.id,
  });

  return {
    questions,
    quizAttempt,
    questionsLoading,
    attemptLoading
  };
};
