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

  // Student performance analytics
  const studentAnalytics = useQuery({
    queryKey: ['analytics-students', userId, filteredCourseIds],
    queryFn: async () => {
      if (filteredCourseIds.length === 0) return { topStudents: [], bottomStudents: [], averages: {} };
      
      // Get student performance data
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select(`
          student_id,
          progress,
          completed_at,
          courses!inner(title)
        `)
        .in('course_id', filteredCourseIds);

      if (error) throw error;
      if (!enrollments?.length) return { topStudents: [], bottomStudents: [], averages: {} };

      // Get quiz attempts for additional metrics
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('student_id, current_score, is_completed')
        .in('course_id', filteredCourseIds)
        .eq('is_completed', true);

      // Get student XP data
      const studentIds = enrollments.map(e => e.student_id);
      const { data: studentXP } = await supabase
        .from('student_xp')
        .select('student_id, total_xp')
        .in('student_id', studentIds);

      // Calculate student performance metrics
      const studentMetrics = enrollments.reduce((acc: any, enrollment: any) => {
        const studentId = enrollment.student_id;
        if (!acc[studentId]) {
          acc[studentId] = {
            studentId,
            coursesEnrolled: 0,
            coursesCompleted: 0,
            totalProgress: 0,
            totalXP: 0,
            quizScores: []
          };
        }
        
        acc[studentId].coursesEnrolled++;
        acc[studentId].totalProgress += enrollment.progress || 0;
        if (enrollment.completed_at) {
          acc[studentId].coursesCompleted++;
        }
        
        return acc;
      }, {});

      // Add XP data
      studentXP?.forEach((xp: any) => {
        if (studentMetrics[xp.student_id]) {
          studentMetrics[xp.student_id].totalXP = xp.total_xp;
        }
      });

      // Add quiz scores
      quizAttempts?.forEach((attempt: any) => {
        if (studentMetrics[attempt.student_id]) {
          studentMetrics[attempt.student_id].quizScores.push(attempt.current_score || 0);
        }
      });

      // Calculate final metrics and anonymize
      const studentsArray = Object.values(studentMetrics).map((student: any, index: number) => {
        const avgProgress = student.coursesEnrolled > 0 ? student.totalProgress / student.coursesEnrolled : 0;
        const avgQuizScore = student.quizScores.length > 0 
          ? student.quizScores.reduce((sum: number, score: number) => sum + score, 0) / student.quizScores.length 
          : 0;
        const completionRate = student.coursesEnrolled > 0 ? (student.coursesCompleted / student.coursesEnrolled) * 100 : 0;
        
        return {
          anonymizedName: `Student ${index + 1}`,
          avgProgress: Math.round(avgProgress),
          avgQuizScore: Math.round(avgQuizScore),
          totalXP: student.totalXP,
          completionRate: Math.round(completionRate),
          coursesCompleted: student.coursesCompleted,
          coursesEnrolled: student.coursesEnrolled
        };
      });

      // Sort by overall performance (combination of progress, completion rate, and XP)
      studentsArray.sort((a, b) => {
        const scoreA = (a.avgProgress * 0.4) + (a.completionRate * 0.4) + (a.totalXP * 0.2);
        const scoreB = (b.avgProgress * 0.4) + (b.completionRate * 0.4) + (b.totalXP * 0.2);
        return scoreB - scoreA;
      });

      // Calculate averages
      const averages = {
        avgProgress: Math.round(studentsArray.reduce((sum, s) => sum + s.avgProgress, 0) / studentsArray.length) || 0,
        avgCompletionRate: Math.round(studentsArray.reduce((sum, s) => sum + s.completionRate, 0) / studentsArray.length) || 0,
        avgXP: Math.round(studentsArray.reduce((sum, s) => sum + s.totalXP, 0) / studentsArray.length) || 0,
        totalStudents: studentsArray.length
      };

      return {
        topStudents: studentsArray.slice(0, 3),
        bottomStudents: studentsArray.slice(-3).reverse(),
        averages
      };
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
    difficultQuestions: difficultQuestions.data || [],
    studentAnalytics: studentAnalytics.data || { topStudents: [], bottomStudents: [], averages: {} },
    isLoading: totalEnrollments.isLoading || totalQuizAttempts.isLoading || 
               perfectCompletions.isLoading || avgSessionDuration.isLoading ||
               completionRate.isLoading || courseDifficultyRanking.isLoading || 
               dropoutPoints.isLoading || difficultQuestions.isLoading ||
               studentAnalytics.isLoading,
    error: totalEnrollments.error || totalQuizAttempts.error || 
           perfectCompletions.error || avgSessionDuration.error ||
           completionRate.error || courseDifficultyRanking.error ||
           dropoutPoints.error || difficultQuestions.error ||
           studentAnalytics.error
  };
};