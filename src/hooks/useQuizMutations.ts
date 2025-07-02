
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface QuizAttempt {
  id: string;
  current_question_index: number;
  focus_points: number;
  current_score: number;
  is_completed: boolean;
  completed_at?: string;
}

export const useQuizMutations = (quizAttemptId: string | null, courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Update quiz attempt mutation
  const updateQuizAttemptMutation = useMutation({
    mutationFn: async (updates: Partial<QuizAttempt>) => {
      if (!quizAttemptId) return;

      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizAttemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempt'] });
    }
  });

  // Submit answer mutation - now uses upsert to handle retries
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer, correct, attemptCount, xpEarned }: { 
      questionId: string; 
      answer: string; 
      correct: boolean;
      attemptCount: number;
      xpEarned: number;
    }) => {
      console.log('Submitting answer with XP:', xpEarned);
      
      const { data, error } = await supabase
        .from('student_answers')
        .upsert({
          student_id: user!.id,
          question_id: questionId,
          selected_answer: answer,
          is_correct: correct,
          attempt_count: attemptCount,
          xp_earned: xpEarned,
          answered_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,question_id'
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Answer submitted successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidating queries after answer submission');
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-xp'] });
      queryClient.invalidateQueries({ queryKey: ['student-achievements'] });
    }
  });

  // Update course progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      if (!courseId) throw new Error('Course ID is required');

      const { data, error } = await supabase
        .from('course_enrollments')
        .update({ progress })
        .eq('course_id', courseId)
        .eq('student_id', user!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  return {
    updateQuizAttemptMutation,
    submitAnswerMutation,
    updateProgressMutation
  };
};
