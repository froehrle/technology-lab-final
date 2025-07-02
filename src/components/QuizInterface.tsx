
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
  lives_remaining: number;
  current_score: number;
  is_completed: boolean;
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
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);

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
            lives_remaining: 5,
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
      setLives(quizAttempt.lives_remaining);
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
    mutationFn: async ({ questionId, answer, correct }: { questionId: string; answer: string; correct: boolean }) => {
      const { data, error } = await supabase
        .from('student_answers')
        .upsert([
          {
            student_id: user!.id,
            question_id: questionId,
            selected_answer: answer,
            is_correct: correct
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

  const handleSubmitAnswer = () => {
    const answerToSubmit = currentQuestion?.question_type === 'text' ? textAnswer : selectedAnswer;
    if (!answerToSubmit || !currentQuestion) return;

    const correct = answerToSubmit === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    const newScore = correct ? score + (currentQuestion.points || 1) : score;
    const newLives = correct ? lives : lives - 1;

    setScore(newScore);
    setLives(newLives);

    // Update quiz attempt
    updateQuizAttemptMutation.mutate({
      current_score: newScore,
      lives_remaining: newLives
    });

    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      answer: answerToSubmit,
      correct
    });
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
        lives_remaining: 5,
        current_score: 0,
        is_completed: false
      });
    }
    
    // Reset local state
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTextAnswer('');
    setShowResult(false);
    setLives(5);
    setScore(0);
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

  if (lives <= 0) {
    return <GameOverCard score={score} onRestart={handleRestart} />;
  }

  const hasAnswer = currentQuestion?.question_type === 'multiple_choice' ? !!selectedAnswer : !!textAnswer;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <QuizProgressHeader
        lives={lives}
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
