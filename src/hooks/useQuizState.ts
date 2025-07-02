import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
}

interface QuizAttempt {
  id: string;
  current_question_index: number;
  focus_points: number;
  current_score: number;
  is_completed: boolean;
  completed_at?: string;
}

export const useQuizState = (courseId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [focusPoints, setFocusPoints] = useState(100);
  const [score, setScore] = useState(0);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [questionAttempts, setQuestionAttempts] = useState<{ [key: string]: number }>({});
  const [canProceed, setCanProceed] = useState(false);

  // Fetch questions
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

  // Initialize state from quiz attempt
  useEffect(() => {
    if (quizAttempt) {
      setQuizAttemptId(quizAttempt.id);
      setCurrentQuestionIndex(quizAttempt.current_question_index);
      setFocusPoints(quizAttempt.focus_points || 100);
      setScore(quizAttempt.current_score);
    }
  }, [quizAttempt]);

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
        .eq('course_id', courseId)
        .eq('student_id', user!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  return {
    // State
    currentQuestionIndex,
    selectedAnswer,
    textAnswer,
    showResult,
    isCorrect,
    focusPoints,
    score,
    questionAttempts,
    canProceed,
    
    // Data
    questions,
    quizAttempt,
    questionsLoading,
    attemptLoading,
    
    // Setters
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setTextAnswer,
    setShowResult,
    setIsCorrect,
    setFocusPoints,
    setScore,
    setQuestionAttempts,
    setCanProceed,
    
    // Mutations
    updateQuizAttemptMutation,
    submitAnswerMutation,
    updateProgressMutation,
    
    // Utils
    toast,
    queryClient
  };
};
