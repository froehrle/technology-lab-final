
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useQuizData } from './useQuizData';
import { useQuizMutations } from './useQuizMutations';

export const useQuizState = (courseId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [focusPoints, setFocusPoints] = useState(100);
  const [score, setScore] = useState(0);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [questionAttempts, setQuestionAttempts] = useState<{ [key: string]: number }>({});
  const [canProceed, setCanProceed] = useState(false);

  // Get data and mutations
  const { questions, quizAttempt, questionsLoading, attemptLoading } = useQuizData(courseId);
  const { updateQuizAttemptMutation, submitAnswerMutation, updateProgressMutation } = useQuizMutations(quizAttemptId);

  // Initialize state from quiz attempt
  useEffect(() => {
    if (quizAttempt) {
      setQuizAttemptId(quizAttempt.id);
      setCurrentQuestionIndex(quizAttempt.current_question_index);
      setFocusPoints(quizAttempt.focus_points || 100);
      setScore(quizAttempt.current_score);
    }
  }, [quizAttempt]);

  return {
    // State
    currentQuestionIndex,
    selectedAnswer,
    textAnswer,
    showResult,
    isCorrect,
    focusPoints,
    score,
    questionAttempts,
    canProceed,
    
    // Data
    questions,
    quizAttempt,
    questionsLoading,
    attemptLoading,
    
    // Setters
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setTextAnswer,
    setShowResult,
    setIsCorrect,
    setFocusPoints,
    setScore,
    setQuestionAttempts,
    setCanProceed,
    
    // Mutations
    updateQuizAttemptMutation,
    submitAnswerMutation,
    updateProgressMutation,
    
    // Utils
    toast,
    queryClient
  };
};
