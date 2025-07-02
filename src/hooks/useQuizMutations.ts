
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

export const useQuizMutations = (quizAttemptId: string | null) => {
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

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer, correct, attemptCount, xpEarned }: { 
      questionId: string; 
      answer: string; 
      correct: boolean;
      attemptCount: number;
      xpEarned: number;
    }) => {
      const { data, error } = await supabase
        .from('student_answers')
        .upsert([
          {
            student_id: user!.id,
            question_id: questionId,
            selected_answer: answer,
            is_correct: correct,
            attempt_count: attemptCount,
            xp_earned: xpEarned
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
    }
  });

  // Update course progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .update({ progress })
        .eq('course_id', progress)
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
