import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizAnalytics = (userId: string | undefined, filteredCourseIds: string[]) => {
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
    queryKey: ['analytics-perfect', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      const { data, error } = await supabase.rpc('get_perfect_completions', {
        course_ids: filteredCourseIds
      });

      if (error) throw error;
      return data || 0;
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  // Average Session Duration - improved calculation using answer timestamps
  const avgSessionDuration = useQuery({
    queryKey: ['analytics-session-duration', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      // Get quiz attempts with their answer timestamps for more accurate duration
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          created_at,
          completed_at,
          student_answers!inner(answered_at)
        `)
        .in('course_id', filteredCourseIds)
        .not('completed_at', 'is', null);

      if (error) throw error;
      if (!data?.length) return 0;

      const durations = data.map(attempt => {
        const answerTimes = attempt.student_answers.map(a => new Date(a.answered_at).getTime());
        if (answerTimes.length === 0) return 0;

        const start = Math.min(new Date(attempt.created_at).getTime(), ...answerTimes);
        const end = Math.max(new Date(attempt.completed_at!).getTime(), ...answerTimes);
        const durationMinutes = (end - start) / (1000 * 60);
        
        // Filter out unrealistic durations (longer than 2 hours)
        return durationMinutes > 120 ? 0 : durationMinutes;
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