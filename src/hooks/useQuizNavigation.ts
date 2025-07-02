import { useQueryClient } from '@tanstack/react-query';
import { showQuizCompletionToast } from '@/utils/quizFeedback';

interface NavigationProps {
  courseId: string;
  currentQuestionIndex: number;
  questions: any[];
  setCurrentQuestionIndex: (index: number) => void;
  setSelectedAnswer: (answer: string) => void;
  setTextAnswer: (answer: string) => void;
  setShowResult: (show: boolean) => void;
  setCanProceed: (can: boolean) => void;
  updateQuizAttemptMutation: any;
  updateProgressMutation: any;
  toast: any;
  clearApiError: () => void;
}

export const useQuizNavigation = ({
  courseId,
  currentQuestionIndex,
  questions,
  setCurrentQuestionIndex,
  setSelectedAnswer,
  setTextAnswer,
  setShowResult,
  setCanProceed,
  updateQuizAttemptMutation,
  updateProgressMutation,
  toast,
  clearApiError
}: NavigationProps) => {
  const queryClient = useQueryClient();

  const handleNextQuestion = async () => {
    await queryClient.invalidateQueries({ queryKey: ['course-questions', courseId] });
    
    const updatedQuestions = queryClient.getQueryData(['course-questions', courseId]) as any[] || questions;
    
    if (currentQuestionIndex < updatedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setTextAnswer('');
      setShowResult(false);
      setCanProceed(false);
      clearApiError();
      
      updateQuizAttemptMutation.mutate({
        current_question_index: nextIndex
      });
      
      const newProgress = Math.round(((nextIndex + 1) / updatedQuestions.length) * 100);
      updateProgressMutation.mutate(newProgress);
    } else {
      updateQuizAttemptMutation.mutate({
        is_completed: true,
        completed_at: new Date().toISOString()
      });
      
      updateProgressMutation.mutate(100);
      
      showQuizCompletionToast(toast);
    }
  };

  const handleRestart = () => {
    updateQuizAttemptMutation.mutate({
      current_question_index: 0,
      focus_points: 100,
      is_completed: false
    });
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTextAnswer('');
    setShowResult(false);
    setCanProceed(false);
    clearApiError();
  };

  return {
    handleNextQuestion,
    handleRestart
  };
};