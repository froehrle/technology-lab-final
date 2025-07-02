import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCourseAnalytics = (userId: string | undefined, filteredCourseIds: string[], courses: any[]) => {
  // Total enrolled students across all courses
  const totalEnrollments = useQuery({
    queryKey: ['analytics-enrollments', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .in('course_id', filteredCourseIds);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

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

  // Average Session Duration
  const avgSessionDuration = useQuery({
    queryKey: ['analytics-session-duration', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('created_at, completed_at')
        .in('course_id', filteredCourseIds)
        .not('completed_at', 'is', null);

      if (error) throw error;
      if (!data?.length) return 0;

      const durations = data.map(attempt => {
        const start = new Date(attempt.created_at);
        const end = new Date(attempt.completed_at!);
        return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      });

      return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  // Completion Rate
  const completionRate = useQuery({
    queryKey: ['analytics-completion-rate', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('id, completed_at')
        .in('course_id', filteredCourseIds);

      if (enrollError) throw enrollError;
      if (!enrollments?.length) return 0;

      const completedCount = enrollments.filter(e => e.completed_at).length;
      return Math.round((completedCount / enrollments.length) * 100);
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  // Course Difficulty Ranking
  const courseDifficultyRanking = useQuery({
    queryKey: ['analytics-course-difficulty', userId],
    queryFn: async () => {
      const { data: courseStats, error } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          completed_at,
          courses!inner(title)
        `)
        .in('course_id', courses.map(c => c.id));

      if (error) throw error;
      if (!courseStats?.length) return [];

      const statsMap = courseStats.reduce((acc: any, enrollment: any) => {
        const courseId = enrollment.course_id;
        if (!acc[courseId]) {
          acc[courseId] = {
            courseId,
            title: enrollment.courses.title,
            totalEnrollments: 0,
            completions: 0
          };
        }
        acc[courseId].totalEnrollments++;
        if (enrollment.completed_at) {
          acc[courseId].completions++;
        }
        return acc;
      }, {});

      return Object.values(statsMap)
        .map((stat: any) => ({
          ...stat,
          completionRate: stat.totalEnrollments > 0 ? (stat.completions / stat.totalEnrollments) * 100 : 0
        }))
        .sort((a: any, b: any) => a.completionRate - b.completionRate);
    },
    enabled: !!userId && courses.length > 0,
  });

  // Dropout Points
  const dropoutPoints = useQuery({
    queryKey: ['analytics-dropout-points', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return [];
      
      const { data: attempts, error } = await supabase
        .from('quiz_attempts')
        .select('current_question_index, is_completed, course_id, courses!inner(title)')
        .in('course_id', filteredCourseIds)
        .eq('is_completed', false);

      if (error) throw error;
      if (!attempts?.length) return [];

      const dropoutMap = attempts.reduce((acc: any, attempt: any) => {
        const key = `${attempt.course_id}-${attempt.current_question_index}`;
        if (!acc[key]) {
          acc[key] = {
            courseTitle: attempt.courses.title,
            questionIndex: attempt.current_question_index || 0,
            dropoutCount: 0
          };
        }
        acc[key].dropoutCount++;
        return acc;
      }, {});

      return Object.values(dropoutMap)
        .sort((a: any, b: any) => b.dropoutCount - a.dropoutCount)
        .slice(0, 5);
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  return {
    totalEnrollments: totalEnrollments.data || 0,
    totalQuizAttempts: totalQuizAttempts.data || 0,
    perfectCompletions: perfectCompletions.data || 0,
    avgSessionDuration: avgSessionDuration.data || 0,
    completionRate: completionRate.data || 0,
    courseDifficultyRanking: courseDifficultyRanking.data || [],
    dropoutPoints: dropoutPoints.data || [],
    isLoading: totalEnrollments.isLoading || totalQuizAttempts.isLoading || 
               perfectCompletions.isLoading || avgSessionDuration.isLoading ||
               completionRate.isLoading || courseDifficultyRanking.isLoading || 
               dropoutPoints.isLoading,
    error: totalEnrollments.error || totalQuizAttempts.error || 
           perfectCompletions.error || avgSessionDuration.error ||
           completionRate.error || courseDifficultyRanking.error ||
           dropoutPoints.error
  };
};