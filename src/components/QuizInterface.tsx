
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import QuizProgressHeader from './quiz/QuizProgressHeader';
import QuestionDisplay from './quiz/QuestionDisplay';
import QuizActions from './quiz/QuizActions';
import GameOverCard from './quiz/GameOverCard';
import NoQuestionsCard from './quiz/NoQuestionsCard';
import QuizCompletedCard from './quiz/QuizCompletedCard';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
}

interface QuizAttempt {
  id: string;
  current_question_index: number;
  focus_points: number;
  current_score: number;
  is_completed: boolean;
  completed_at?: string;
}

interface QuizInterfaceProps {
  courseId: string;
}

const QuizInterface = ({ courseId }: QuizInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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

  // Fetch questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['course-questions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Question[];
    },
    enabled: !!courseId,
  });

  // Fetch or create quiz attempt
  const { data: quizAttempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['quiz-attempt', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First, try to get existing attempt
      const { data: existingAttempt, error: fetchError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingAttempt) {
        return existingAttempt as QuizAttempt;
      }

      // Create new attempt if none exists
      const { data: newAttempt, error: createError } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            student_id: user.id,
            course_id: courseId,
            current_question_index: 0,
            focus_points: 100,
            current_score: 0,
            is_completed: false
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      return newAttempt as QuizAttempt;
    },
    enabled: !!courseId && !!user?.id,
  });

  // Initialize state from quiz attempt
  useEffect(() => {
    if (quizAttempt) {
      setQuizAttemptId(quizAttempt.id);
      setCurrentQuestionIndex(quizAttempt.current_question_index);
      setFocusPoints(quizAttempt.focus_points || 100);
      setScore(quizAttempt.current_score);
    }
  }, [quizAttempt]);

  // Update quiz attempt mutation
  const updateQuizAttemptMutation = useMutation({
    mutationFn: async (updates: Partial<QuizAttempt>) => {
      if (!quizAttemptId) return;

      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizAttemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempt'] });
    }
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer, correct, attemptCount, xpEarned }: { 
      questionId: string; 
      answer: string; 
      correct: boolean;
      attemptCount: number;
      xpEarned: number;
    }) => {
      const { data, error } = await supabase
        .from('student_answers')
        .upsert([
          {
            student_id: user!.id,
            question_id: questionId,
            selected_answer: answer,
            is_correct: correct,
            attempt_count: attemptCount,
            xp_earned: xpEarned
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
    }
  });

  // Update course progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .update({ progress })
        .eq('course_id', courseId)
        .eq('student_id', user!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleTextAnswerChange = (answer: string) => {
    setTextAnswer(answer);
  };

  const calculateXP = (attemptCount: number, correct: boolean): number => {
    if (!correct) return 0;
    
    switch (attemptCount) {
      case 1: return 20;
      case 2: return 10;
      default: return 0;
    }
  };

  const handleSubmitAnswer = () => {
    const answerToSubmit = currentQuestion?.question_type === 'text' ? textAnswer : selectedAnswer;
    if (!answerToSubmit || !currentQuestion) return;

    const correct = answerToSubmit === currentQuestion.correct_answer;
    const currentAttempts = questionAttempts[currentQuestion.id] || 0;
    const newAttempts = currentAttempts + 1;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    // Update attempt count for current question
    setQuestionAttempts(prev => ({
      ...prev,
      [currentQuestion.id]: newAttempts
    }));

    // Calculate XP and focus points changes
    const xpEarned = calculateXP(newAttempts, correct);
    let newFocusPoints = focusPoints;
    let newScore = score;

    if (correct) {
      newFocusPoints = Math.min(100, focusPoints + 5);
      newScore = score + (currentQuestion.points || 1) + xpEarned;
    } else {
      newFocusPoints = Math.max(0, focusPoints - 10);
    }

    setFocusPoints(newFocusPoints);
    setScore(newScore);

    // Update quiz attempt
    updateQuizAttemptMutation.mutate({
      current_score: newScore,
      focus_points: newFocusPoints
    });
    
    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      answer: answerToSubmit,
      correct,
      attemptCount: newAttempts,
      xpEarned
    });

    // Show XP feedback
    if (xpEarned > 0) {
      toast({
        title: `+${xpEarned} XP!`,
        description: `${newAttempts === 1 ? 'Perfekt beim ersten Versuch!' : 'Richtig beim zweiten Versuch!'}`,
      });
    } else if (correct && newAttempts >= 3) {
      toast({
        title: "Richtig!",
        description: "Kein XP nach dem 3. Versuch, aber weiter so!",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setTextAnswer('');
      setShowResult(false);
      
      // Update quiz attempt with new question index
      updateQuizAttemptMutation.mutate({
        current_question_index: nextIndex
      });
      
      // Update course progress
      const newProgress = Math.round(((nextIndex + 1) / questions.length) * 100);
      updateProgressMutation.mutate(newProgress);
    } else {
      // Quiz completed
      updateQuizAttemptMutation.mutate({
        is_completed: true,
        completed_at: new Date().toISOString()
      });
      
      updateProgressMutation.mutate(100);
      
      toast({
        title: "Quiz abgeschlossen!",
        description: `Glückwunsch! Sie haben ${score} Punkte erreicht.`,
      });
    }
  };

  const handleRestart = () => {
    // Reset quiz attempt
    if (quizAttemptId) {
      updateQuizAttemptMutation.mutate({
        current_question_index: 0,
        focus_points: 100,
        current_score: 0,
        is_completed: false
      });
    }
    
    // Reset local state
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTextAnswer('');
    setShowResult(false);
    setFocusPoints(100);
    setScore(0);
    setQuestionAttempts({});
  };

  if (questionsLoading || attemptLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!questions.length) {
    return <NoQuestionsCard />;
  }

  // Check if quiz is already completed
  if (quizAttempt?.is_completed) {
    return <QuizCompletedCard score={quizAttempt.current_score} onRestart={handleRestart} />;
  }

  // Show focus warning but allow continuation
  if (focusPoints <= 0) {
    toast({
      title: "Fokus erschöpft",
      description: "Eine Pause wird empfohlen, aber Sie können fortfahren.",
      variant: "destructive"
    });
  }

  const hasAnswer = currentQuestion?.question_type === 'multiple_choice' ? !!selectedAnswer : !!textAnswer;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <QuizProgressHeader
        focusPoints={focusPoints}
        score={score}
        progress={progress}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
      />

      <QuestionDisplay
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        textAnswer={textAnswer}
        showResult={showResult}
        isCorrect={isCorrect}
        onAnswerSelect={handleAnswerSelect}
        onTextAnswerChange={handleTextAnswerChange}
      />

      <QuizActions
        showResult={showResult}
        hasAnswer={hasAnswer}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onSubmitAnswer={handleSubmitAnswer}
        onNextQuestion={handleNextQuestion}
      />
    </div>
  );
};

export default QuizInterface;
