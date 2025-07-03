import { useEnrollmentAnalytics } from './useEnrollmentAnalytics';
import { useQuizAnalytics } from './useQuizAnalytics';
import { useOptimizedAnalytics } from './useOptimizedAnalytics';
import { useDropoutAnalytics } from './useDropoutAnalytics';
import { useStudentPerformanceAnalytics } from './useStudentPerformanceAnalytics';

export const useCourseAnalytics = (userId: string | undefined, filteredCourseIds: string[], courses: any[]) => {
  const enrollmentData = useEnrollmentAnalytics(userId, filteredCourseIds);
  const quizData = useQuizAnalytics(userId, filteredCourseIds);
  const optimizedData = useOptimizedAnalytics(userId, courses);
  const dropoutData = useDropoutAnalytics(userId, filteredCourseIds);
  const studentData = useStudentPerformanceAnalytics(userId, filteredCourseIds);

  return {
    // Enrollment metrics
    totalEnrollments: enrollmentData.totalEnrollments,
    completionRate: enrollmentData.completionRate,
    
    // Quiz metrics
    totalQuizAttempts: quizData.totalQuizAttempts,
    perfectCompletions: quizData.perfectCompletions,
    avgSessionDuration: quizData.avgSessionDuration,
    
    // Course difficulty analysis (now optimized)
    courseDifficultyRanking: optimizedData.courseDifficultyRanking,
    
    // Dropout and difficulty analysis
    dropoutPoints: dropoutData.dropoutPoints,
    difficultQuestions: dropoutData.difficultQuestions,
    
    // Student performance
    studentAnalytics: studentData.studentAnalytics,
    
    // Combined loading and error states
    isLoading: enrollmentData.isLoading || quizData.isLoading || optimizedData.isLoading || 
               dropoutData.isLoading || studentData.isLoading,
    error: enrollmentData.error || quizData.error || optimizedData.error || 
           dropoutData.error || studentData.error
  };
};