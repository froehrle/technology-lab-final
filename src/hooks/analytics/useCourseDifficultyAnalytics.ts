import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCourseDifficultyAnalytics = (userId: string | undefined, courses: any[]) => {
  // Course Difficulty Ranking with Multi-Factor Analysis
  const courseDifficultyRanking = useQuery({
    queryKey: ['analytics-course-difficulty', userId],
    queryFn: async () => {
      if (!courses.length) return [];

      const courseIds = courses.map(c => c.id);

      // Get basic enrollment and completion data
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          completed_at,
          courses!inner(id, title)
        `)
        .in('course_id', courseIds);

      if (enrollmentError) throw enrollmentError;

      // Get quiz attempt data for dropout analysis
      const { data: quizAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('course_id, is_completed, student_id')
        .in('course_id', courseIds);

      if (attemptsError) throw attemptsError;

      // Get student answers for wrong answer rate and attempts analysis
      const { data: studentAnswers, error: answersError } = await supabase
        .from('student_answers')
        .select(`
          is_correct,
          attempt_count,
          student_id,
          questions!inner(course_id)
        `)
        .in('questions.course_id', courseIds);

      if (answersError) throw answersError;

      // Calculate metrics for each course
      const courseMetrics = courses.map(course => {
        const courseId = course.id;
        
        // Basic enrollment stats
        const enrollments = enrollmentData?.filter(e => e.course_id === courseId) || [];
        const totalEnrollments = enrollments.length;
        const completions = enrollments.filter(e => e.completed_at).length;
        const completionRate = totalEnrollments > 0 ? (completions / totalEnrollments) * 100 : 0;

        // Quiz attempt stats
        const attempts = quizAttempts?.filter(a => a.course_id === courseId) || [];
        const totalAttempts = attempts.length;
        const completedAttempts = attempts.filter(a => a.is_completed).length;
        const dropoutRate = totalAttempts > 0 ? ((totalAttempts - completedAttempts) / totalAttempts) * 100 : 0;

        // Student answer analysis
        const answers = studentAnswers?.filter(a => a.questions.course_id === courseId) || [];
        const totalAnswers = answers.length;
        const wrongAnswers = answers.filter(a => !a.is_correct).length;
        const wrongAnswerRate = totalAnswers > 0 ? (wrongAnswers / totalAnswers) * 100 : 0;
        
        // Average attempts per question
        const avgAttemptsPerQuestion = totalAnswers > 0 
          ? answers.reduce((sum, answer) => sum + (answer.attempt_count || 1), 0) / totalAnswers 
          : 1;

        // Perfect completion rate (students who got all questions right on first try)
        const studentsWithAnswers = [...new Set(answers.map(a => a.student_id))];
        let perfectCompletions = 0;
        
        studentsWithAnswers.forEach(studentId => {
          const studentAnswers = answers.filter(a => a.student_id === studentId);
          const allCorrectFirstTry = studentAnswers.every(a => a.is_correct && a.attempt_count === 1);
          if (allCorrectFirstTry && studentAnswers.length > 0) {
            perfectCompletions++;
          }
        });
        
        const perfectCompletionRate = studentsWithAnswers.length > 0 
          ? (perfectCompletions / studentsWithAnswers.length) * 100 
          : 0;

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
          // Breakdown for UI display
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
    courseDifficultyRanking: courseDifficultyRanking.data || [],
    isLoading: courseDifficultyRanking.isLoading,
    error: courseDifficultyRanking.error,
  };
};