import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDropoutAnalytics = (userId: string | undefined, filteredCourseIds: string[], attemptFilter: string = 'latest') => {
  // Dropout Points
  const dropoutPoints = useQuery({
    queryKey: ['analytics-dropout-points', userId, filteredCourseIds, attemptFilter],
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

  // Most difficult questions - calculate dynamically based on attempt filter
  const difficultQuestions = useQuery({
    queryKey: ['analytics-difficult', userId, filteredCourseIds, attemptFilter],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return [];
      
      // Use appropriate table based on attempt filter
      const tableName = attemptFilter === 'first' ? 'student_first_attempts' : 
                       attemptFilter === 'all' ? 'student_all_attempts' : 'student_latest_answers';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          question_id,
          is_correct,
          attempt_count,
          questions!inner(
            question_text,
            course_id,
            courses!inner(title)
          )
        `)
        .in('questions.course_id', filteredCourseIds);

      if (error) throw error;
      if (!data?.length) return [];

      // Group by question and calculate stats
      const questionStats = data.reduce((acc: any, answer: any) => {
        const questionId = answer.question_id;
        if (!acc[questionId]) {
          acc[questionId] = {
            question_id: questionId,
            question_text: answer.questions.question_text,
            course_id: answer.questions.course_id,
            course_title: answer.questions.courses.title,
            total_answers: 0,
            wrong_answers: 0,
            total_attempts: 0
          };
        }
        
        acc[questionId].total_answers++;
        acc[questionId].total_attempts += answer.attempt_count || 1;
        if (!answer.is_correct) {
          acc[questionId].wrong_answers++;
        }
        
        return acc;
      }, {});

      // Calculate percentages and filter for statistical significance
      const results = Object.values(questionStats)
        .filter((q: any) => q.total_answers >= 1) // At least 1 attempt for significance
        .map((q: any) => ({
          ...q,
          wrong_percentage: Math.round((q.wrong_answers / q.total_answers) * 100),
          avg_attempts: Math.round((q.total_attempts / q.total_answers) * 100) / 100
        }))
        .sort((a: any, b: any) => b.wrong_percentage - a.wrong_percentage)
        .slice(0, 3);

      return results;
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