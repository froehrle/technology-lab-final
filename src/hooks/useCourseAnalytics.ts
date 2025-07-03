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

      // Get student answers for performance analysis
      const { data: studentAnswers } = await supabase
        .from('student_answers')
        .select(`
          student_id,
          is_correct,
          attempt_count,
          questions!inner(
            course_id,
            courses!inner(title)
          )
        `)
        .in('questions.course_id', filteredCourseIds);

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
            quizScores: [],
            coursePerformance: {}
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

      // Analyze student answers to find struggling courses
      studentAnswers?.forEach((answer: any) => {
        const studentId = answer.student_id;
        const courseId = answer.questions.course_id;
        const courseTitle = answer.questions.courses.title;
        
        if (studentMetrics[studentId]) {
          if (!studentMetrics[studentId].coursePerformance[courseId]) {
            studentMetrics[studentId].coursePerformance[courseId] = {
              courseTitle,
              totalAnswers: 0,
              wrongAnswers: 0,
              totalAttempts: 0
            };
          }
          
          const perf = studentMetrics[studentId].coursePerformance[courseId];
          perf.totalAnswers++;
          perf.totalAttempts += answer.attempt_count || 1;
          if (!answer.is_correct) {
            perf.wrongAnswers++;
          }
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
        
        // Find struggling courses based on performance metrics
        const coursePerformanceArray = Object.values(student.coursePerformance).map((perf: any) => {
          const wrongPercentage = perf.totalAnswers > 0 ? (perf.wrongAnswers / perf.totalAnswers) * 100 : 0;
          const avgAttempts = perf.totalAnswers > 0 ? perf.totalAttempts / perf.totalAnswers : 0;
          // Calculate difficulty score: high wrong percentage + high attempts = more difficult
          const difficultyScore = wrongPercentage + (avgAttempts - 1) * 20;
          
          return {
            courseTitle: perf.courseTitle,
            wrongPercentage,
            avgAttempts,
            difficultyScore
          };
        });
        
        // Get top 3 most difficult courses for this student
        const strugglingCourses = coursePerformanceArray
          .sort((a, b) => b.difficultyScore - a.difficultyScore)
          .slice(0, 3)
          .filter(course => course.difficultyScore > 20) // Only include courses with significant difficulty
          .map(course => course.courseTitle);
        
        return {
          anonymizedName: `Student ${index + 1}`,
          avgProgress: Math.round(avgProgress),
          avgQuizScore: Math.round(avgQuizScore),
          totalXP: student.totalXP,
          completionRate: Math.round(completionRate),
          coursesCompleted: student.coursesCompleted,
          coursesEnrolled: student.coursesEnrolled,
          strugglingCourses
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