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

  // Perfect completions (100% correct answers)
  const perfectCompletions = useQuery({
    queryKey: ['analytics-perfect', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      // Get completed quiz attempts
      const { data: completedAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('id, student_id, course_id')
        .in('course_id', filteredCourseIds)
        .eq('is_completed', true);

      if (attemptsError) throw attemptsError;
      if (!completedAttempts?.length) return 0;

      // For each completed attempt, check if all answers were correct
      let perfectCount = 0;
      
      for (const attempt of completedAttempts) {
        // Get all questions for this course
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id')
          .eq('course_id', attempt.course_id);

        if (questionsError) continue;
        if (!questions?.length) continue;

        // Get all answers for this student and course
        const { data: answers, error: answersError } = await supabase
          .from('student_answers')
          .select('is_correct, question_id')
          .eq('student_id', attempt.student_id)
          .in('question_id', questions.map(q => q.id));

        if (answersError) continue;
        if (!answers?.length) continue;

        // Check if all answers are correct and student answered all questions
        const allCorrect = answers.length === questions.length && 
                          answers.every(answer => answer.is_correct);
        
        if (allCorrect) {
          perfectCount++;
        }
      }

      return perfectCount;
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

  // Average Attempts per Question
  const avgAttemptsPerQuestion = useQuery({
    queryKey: ['analytics-avg-attempts', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return 0;
      
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          attempt_count,
          questions!inner(course_id)
        `)
        .in('questions.course_id', filteredCourseIds);

      if (error) throw error;
      if (!data?.length) return 0;

      const totalAttempts = data.reduce((sum, answer) => sum + (answer.attempt_count || 1), 0);
      return totalAttempts / data.length;
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

  // Most difficult questions
  const difficultQuestions = useQuery({
    queryKey: ['analytics-difficult', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          question_id,
          is_correct,
          attempt_count,
          questions!inner(
            question_text,
            course_id,
            courses!inner(
              title
            )
          )
        `)
        .in('questions.course_id', filteredCourseIds);

      if (error) throw error;
      if (!data?.length) return [];

      // Group by question and calculate difficulty metrics
      const questionStats = data.reduce((acc: any, answer: any) => {
        const questionId = answer.question_id;
        
        if (!acc[questionId]) {
          acc[questionId] = {
            questionId,
            questionText: answer.questions.question_text,
            courseTitle: answer.questions.courses.title,
            totalAttempts: 0,
            wrongAnswers: 0,
            totalAnswers: 0,
            avgAttempts: 0
          };
        }
        
        acc[questionId].totalAttempts += answer.attempt_count || 1;
        acc[questionId].totalAnswers += 1;
        if (!answer.is_correct) {
          acc[questionId].wrongAnswers += 1;
        }
        
        return acc;
      }, {});

      // Calculate average attempts and sort by difficulty
      const questionArray = Object.values(questionStats).map((stat: any) => ({
        ...stat,
        avgAttempts: stat.totalAttempts / stat.totalAnswers,
        wrongPercentage: (stat.wrongAnswers / stat.totalAnswers) * 100
      }));

      // Sort by combination of wrong percentage and average attempts
      questionArray.sort((a: any, b: any) => {
        const scoreA = a.wrongPercentage + (a.avgAttempts - 1) * 10;
        const scoreB = b.wrongPercentage + (b.avgAttempts - 1) * 10;
        return scoreB - scoreA;
      });

      return questionArray.slice(0, 5);
    },
    enabled: !!userId && filteredCourseIds.length > 0,
  });

  return {
    totalEnrollments: totalEnrollments.data || 0,
    totalQuizAttempts: totalQuizAttempts.data || 0,
    perfectCompletions: perfectCompletions.data || 0,
    avgSessionDuration: avgSessionDuration.data || 0,
    completionRate: completionRate.data || 0,
    avgAttemptsPerQuestion: avgAttemptsPerQuestion.data || 0,
    courseDifficultyRanking: courseDifficultyRanking.data || [],
    dropoutPoints: dropoutPoints.data || [],
    difficultQuestions: difficultQuestions.data || []
  };
};