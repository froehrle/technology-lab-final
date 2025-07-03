import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStudentPerformanceAnalytics = (userId: string | undefined, filteredCourseIds: string[]) => {
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
    studentAnalytics: studentAnalytics.data || { topStudents: [], bottomStudents: [], averages: {} },
    isLoading: studentAnalytics.isLoading,
    error: studentAnalytics.error,
  };
};