import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDropoutAnalytics = (userId: string | undefined, filteredCourseIds: string[]) => {
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

  // Most difficult questions using optimized view
  const difficultQuestions = useQuery({
    queryKey: ['analytics-difficult', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('difficult_questions_stats')
        .select('*')
        .in('course_id', filteredCourseIds)
        .order('wrong_percentage', { ascending: false })
        .order('avg_attempts', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  return {
    dropoutPoints: dropoutPoints.data || [],
    difficultQuestions: difficultQuestions.data || [],
    isLoading: dropoutPoints.isLoading || difficultQuestions.isLoading,
    error: dropoutPoints.error || difficultQuestions.error,
  };
};