import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnrollmentAnalytics = (userId: string | undefined, filteredCourseIds: string[]) => {
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

  return {
    totalEnrollments: totalEnrollments.data || 0,
    completionRate: completionRate.data || 0,
    isLoading: totalEnrollments.isLoading || completionRate.isLoading,
    error: totalEnrollments.error || completionRate.error,
  };
};