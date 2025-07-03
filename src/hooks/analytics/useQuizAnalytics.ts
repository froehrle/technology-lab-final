import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizAnalytics = (userId: string | undefined, filteredCourseIds: string[], attemptFilter: string = 'latest') => {
  // Total quiz attempts
  const totalQuizAttempts = useQuery({
    queryKey: ['analytics-attempts', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id')
        .in('course_id', filteredCourseIds);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  // Perfect completions using optimized database function
  const perfectCompletions = useQuery({
    queryKey: ['analytics-perfect', userId, filteredCourseIds, attemptFilter],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      const { data, error } = await supabase.rpc('get_perfect_completions', {
        course_ids: filteredCourseIds,
        attempt_type: attemptFilter
      });

      if (error) throw error;
      return data || 0;
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  // Average Session Duration - improved calculation with fallback for missing answers
  const avgSessionDuration = useQuery({
    queryKey: ['analytics-session-duration', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      // First try to get attempts with answers for more accurate duration
      const { data: attemptsWithAnswers, error: answersError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          created_at,
          completed_at,
          updated_at,
          student_answers(answered_at)
        `)
        .in('course_id', filteredCourseIds);

      if (answersError) throw answersError;
      if (!attemptsWithAnswers?.length) return 0;

      const durations = attemptsWithAnswers.map(attempt => {
        // If we have student answers, use those timestamps for more accuracy
        if (attempt.student_answers && attempt.student_answers.length > 0) {
          const answerTimes = attempt.student_answers.map(a => new Date(a.answered_at).getTime());
          const start = Math.min(new Date(attempt.created_at).getTime(), ...answerTimes);
          const end = attempt.completed_at 
            ? Math.max(new Date(attempt.completed_at).getTime(), ...answerTimes)
            : Math.max(new Date(attempt.updated_at).getTime(), ...answerTimes);
          
          const durationMinutes = (end - start) / (1000 * 60);
          return durationMinutes > 120 ? 0 : durationMinutes; // Filter out unrealistic durations
        } 
        // Fallback: use created_at to completed_at/updated_at if no answers
        else {
          const start = new Date(attempt.created_at).getTime();
          const end = attempt.completed_at 
            ? new Date(attempt.completed_at).getTime()
            : new Date(attempt.updated_at).getTime();
          
          const durationMinutes = (end - start) / (1000 * 60);
          // Only include if reasonable duration (between 0.1 and 120 minutes)
          return (durationMinutes > 0.1 && durationMinutes <= 120) ? durationMinutes : 0;
        }
      }).filter(duration => duration > 0);

      return durations.length > 0 
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
        : 0;
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  return {
    totalQuizAttempts: totalQuizAttempts.data || 0,
    perfectCompletions: perfectCompletions.data || 0,
    avgSessionDuration: avgSessionDuration.data || 0,
    isLoading: totalQuizAttempts.isLoading || perfectCompletions.isLoading || avgSessionDuration.isLoading,
    error: totalQuizAttempts.error || perfectCompletions.error || avgSessionDuration.error,
  };
};