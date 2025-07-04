
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

interface StudentXP {
  total_xp: number;
}

interface StudentStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface CourseStats {
  course_id: string;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
}

export const useStudentData = (userId: string | undefined) => {
  // Fetch enrollments
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['student-enrollments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description
          )
        `)
        .eq('student_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!userId,
  });

  // Fetch course statistics
  const { data: courseStats = [] } = useQuery({
    queryKey: ['course-stats', userId, enrollments.map(e => e.course_id)],
    queryFn: async () => {
      if (!userId || enrollments.length === 0) return [];
      
      const courseIds = enrollments.map(e => e.course_id);
      
      const stats = await Promise.all(
        courseIds.map(async (courseId) => {
          // Get total questions for this course
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('id')
            .eq('course_id', courseId);

          if (questionsError) throw questionsError;

          // Get student's latest answers for this course
          const { data: answers, error: answersError } = await supabase
            .from('student_latest_answers')
            .select('is_correct, question_id')
            .eq('student_id', userId)
            .in('question_id', questions?.map(q => q.id) || []);

          if (answersError) throw answersError;

          const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
          const wrongAnswers = answers?.filter(a => !a.is_correct).length || 0;

          return {
            course_id: courseId,
            correct_answers: correctAnswers,
            wrong_answers: wrongAnswers,
            total_questions: questions?.length || 0
          } as CourseStats;
        })
      );

      return stats;
    },
    enabled: !!userId && enrollments.length > 0,
  });

  // Fetch student XP
  const { data: studentXP } = useQuery({
    queryKey: ['student-xp', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log('Fetching student XP for user:', userId);
      
      // First, let's check if there are any student_answers records
      const { data: answersData, error: answersError } = await supabase
        .from('student_answers')
        .select('*')
        .eq('student_id', userId);
      
      console.log('Student answers data:', answersData);
      if (answersError) console.error('Error fetching answers:', answersError);
      
      // Now check the XP data
      const { data, error } = await supabase
        .from('student_xp')
        .select('total_xp')
        .eq('student_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching student XP:', error);
        throw error;
      }
      
      console.log('Student XP data:', data);
      
      // If no XP record exists but we have answers with XP, something's wrong with the trigger
      if (!data && answersData && answersData.length > 0) {
        const totalXpFromAnswers = answersData.reduce((sum, answer) => sum + (answer.xp_earned || 0), 0);
        console.log('Total XP from answers (should match XP table):', totalXpFromAnswers);
        
        if (totalXpFromAnswers > 0) {
          console.error('XP record missing despite having answers with XP - trigger may not be working');
        }
      }
      
      return data as StudentXP | null;
    },
    enabled: !!userId,
    refetchInterval: 5000, // Refetch every 5 seconds to ensure fresh data
  });

  // Fetch student streak
  const { data: studentStreak } = useQuery({
    queryKey: ['student-streak', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('student_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('student_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching student streak:', error);
        throw error;
      }
      
      return data as StudentStreak | null;
    },
    enabled: !!userId,
  });

  return {
    enrollments,
    courseStats,
    studentXP,
    studentStreak,
    isLoading
  };
};
