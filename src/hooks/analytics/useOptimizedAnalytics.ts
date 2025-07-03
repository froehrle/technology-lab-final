import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CourseAnalyticsData {
  courseId: string;
  title: string;
  totalEnrollments: number;
  completions: number;
  completionRate: number;
  perfectCompletionRate: number;
  avgAttemptsPerQuestion: number;
  wrongAnswerRate: number;
  dropoutRate: number;
  difficultyScore: number;
  factors: {
    completion: number;
    perfectCompletion: number;
    attempts: number;
    wrongAnswers: number;
    dropouts: number;
  };
}

export const useOptimizedAnalytics = (userId: string | undefined, courses: any[]) => {
  const courseAnalytics = useQuery({
    queryKey: ['optimized-course-analytics', userId, courses.map(c => c.id)],
    queryFn: async () => {
      if (!courses.length) return [];

      const courseIds = courses.map(c => c.id);

      // Get all analytics data in parallel for better performance
      const [
        enrollmentResult,
        quizAttemptsResult,
        perfectCompletionsResult,
        studentAnswersResult
      ] = await Promise.all([
        // Enrollment data
        supabase
          .from('course_enrollments')
          .select('course_id, completed_at')
          .in('course_id', courseIds),

        // Quiz attempts for dropout analysis
        supabase
          .from('quiz_attempts')
          .select('course_id, is_completed')
          .in('course_id', courseIds),

        // Perfect completions using optimized function
        supabase.rpc('get_course_perfect_completions', { course_ids: courseIds }),

        // Latest answers for attempts and accuracy analysis
        supabase
          .from('student_latest_answers')
          .select(`
            is_correct,
            attempt_count,
            questions!inner(course_id)
          `)
          .in('questions.course_id', courseIds)
      ]);

      // Check for errors
      if (enrollmentResult.error) throw enrollmentResult.error;
      if (quizAttemptsResult.error) throw quizAttemptsResult.error;
      if (perfectCompletionsResult.error) throw perfectCompletionsResult.error;
      if (studentAnswersResult.error) throw studentAnswersResult.error;

      const enrollments = enrollmentResult.data || [];
      const quizAttempts = quizAttemptsResult.data || [];
      const perfectCompletions = perfectCompletionsResult.data || [];
      const studentAnswers = studentAnswersResult.data || [];

      // Calculate metrics for each course
      const courseMetrics: CourseAnalyticsData[] = courses.map(course => {
        const courseId = course.id;
        
        // Basic enrollment stats
        const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
        const totalEnrollments = courseEnrollments.length;
        const completions = courseEnrollments.filter(e => e.completed_at).length;
        const completionRate = totalEnrollments > 0 ? (completions / totalEnrollments) * 100 : 0;

        // Perfect completion rate from database function
        const perfectData = perfectCompletions.find(pc => pc.course_id === courseId);
        const perfectCompletionRate = perfectData?.perfect_completion_rate || 0;

        // Quiz attempt stats for dropout rate
        const courseAttempts = quizAttempts.filter(a => a.course_id === courseId);
        const totalAttempts = courseAttempts.length;
        const completedAttempts = courseAttempts.filter(a => a.is_completed).length;
        const dropoutRate = totalAttempts > 0 ? ((totalAttempts - completedAttempts) / totalAttempts) * 100 : 0;

        // Student answer analysis for accuracy and attempts
        const courseAnswers = studentAnswers.filter(a => a.questions.course_id === courseId);
        const totalAnswers = courseAnswers.length;
        const wrongAnswers = courseAnswers.filter(a => !a.is_correct).length;
        const wrongAnswerRate = totalAnswers > 0 ? (wrongAnswers / totalAnswers) * 100 : 0;
        
        // Average attempts per question using latest answers
        const avgAttemptsPerQuestion = totalAnswers > 0 
          ? courseAnswers.reduce((sum, answer) => sum + (answer.attempt_count || 1), 0) / totalAnswers 
          : 1;

        // Calculate multi-factor difficulty score
        const difficultyScore = 
          (100 - completionRate) * 0.25 +                    // Lower completion rate = higher difficulty
          (100 - perfectCompletionRate) * 0.20 +             // Lower perfect rate = higher difficulty  
          (avgAttemptsPerQuestion - 1) * 20 * 0.25 +         // More attempts = higher difficulty
          wrongAnswerRate * 0.20 +                           // More wrong answers = higher difficulty
          dropoutRate * 0.10;                                // More dropouts = higher difficulty

        return {
          courseId,
          title: course.title,
          totalEnrollments,
          completions,
          completionRate: Math.round(completionRate * 10) / 10,
          perfectCompletionRate: Math.round(perfectCompletionRate * 10) / 10,
          avgAttemptsPerQuestion: Math.round(avgAttemptsPerQuestion * 10) / 10,
          wrongAnswerRate: Math.round(wrongAnswerRate * 10) / 10,
          dropoutRate: Math.round(dropoutRate * 10) / 10,
          difficultyScore: Math.round(difficultyScore * 10) / 10,
          factors: {
            completion: Math.round((100 - completionRate) * 0.25 * 10) / 10,
            perfectCompletion: Math.round((100 - perfectCompletionRate) * 0.20 * 10) / 10,
            attempts: Math.round((avgAttemptsPerQuestion - 1) * 20 * 0.25 * 10) / 10,
            wrongAnswers: Math.round(wrongAnswerRate * 0.20 * 10) / 10,
            dropouts: Math.round(dropoutRate * 0.10 * 10) / 10
          }
        };
      });

      // Sort by difficulty score (highest = most difficult)
      return courseMetrics.sort((a, b) => b.difficultyScore - a.difficultyScore);
    },
    enabled: !!userId && courses.length > 0,
  });

  return {
    courseDifficultyRanking: courseAnalytics.data || [],
    isLoading: courseAnalytics.isLoading,
    error: courseAnalytics.error,
  };
};