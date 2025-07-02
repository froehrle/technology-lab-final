import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
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

  const { data: questions = [], isLoading } = useQuery({
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

  const handleSubmitAnswer = () => {
    const answerToSubmit = currentQuestion?.question_type === 'text' ? textAnswer : selectedAnswer;
    if (!answerToSubmit || !currentQuestion) return;

    const correct = answerToSubmit === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + (currentQuestion.points || 1));
    } else {
      setLives(lives - 1);
    }

    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      answer: answerToSubmit,
      correct
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setTextAnswer('');
      setShowResult(false);
      
      // Update progress
      const newProgress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
      updateProgressMutation.mutate(newProgress);
    } else {
      // Quiz completed
      updateProgressMutation.mutate(100);
      toast({
        title: "Quiz abgeschlossen!",
        description: `Glückwunsch! Sie haben ${score} Punkte erreicht.`,
      });
      // Navigate back to dashboard
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Keine Fragen verfügbar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Für diesen Kurs sind noch keine Fragen verfügbar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives <= 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Game Over</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Sie haben alle Leben verloren!</p>
            <p className="text-sm text-gray-500">Endpunktzahl: {score}</p>
            <Button 
              className="w-full mt-4" 
              onClick={() => window.location.reload()}
            >
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header with progress stickman and lives */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Heart 
                key={i} 
                className={`h-6 w-6 ${i < lives ? 'text-red-500 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Score: {score}
          </div>
        </div>
        
        {/* Running Stickman Progress */}
        <div className="relative bg-gray-200 rounded-full h-16 overflow-hidden">
          {/* Track */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-20"></div>
          
          {/* Finish Line */}
          <div className="absolute right-2 top-0 h-full w-1 bg-red-500 flex items-center">
            <div className="text-xs font-bold text-red-600 -rotate-90 whitespace-nowrap origin-center">
              ZIEL
            </div>
          </div>
          
          {/* Running Stickman */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ left: `${Math.min(progress, 90)}%` }}
          >
            <div className="relative">
              {/* Stickman Body */}
              <svg width="32" height="32" viewBox="0 0 32 32" className="animate-bounce">
                {/* Head */}
                <circle cx="16" cy="6" r="4" fill="#333" />
                {/* Body */}
                <line x1="16" y1="10" x2="16" y2="20" stroke="#333" strokeWidth="2" />
                {/* Arms - animated running */}
                <line x1="16" y1="14" x2="12" y2="18" stroke="#333" strokeWidth="2" className="animate-pulse" />
                <line x1="16" y1="14" x2="20" y2="12" stroke="#333" strokeWidth="2" className="animate-pulse" />
                {/* Legs - animated running */}
                <line x1="16" y1="20" x2="12" y2="26" stroke="#333" strokeWidth="2" className="animate-pulse" />
                <line x1="16" y1="20" x2="20" y2="24" stroke="#333" strokeWidth="2" className="animate-pulse" />
              </svg>
              
              {/* Speed lines */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8">
                <div className="flex space-x-1">
                  <div className="w-2 h-0.5 bg-blue-400 animate-pulse"></div>
                  <div className="w-1 h-0.5 bg-blue-300 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-0.5 bg-blue-200 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          Frage {currentQuestionIndex + 1} von {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion?.question_text}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion?.question_type === 'multiple_choice' ? (
              currentQuestion?.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className={`w-full text-left justify-start h-auto p-4 ${
                    showResult
                      ? option === currentQuestion.correct_answer
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : selectedAnswer === option && !isCorrect
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : ''
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                    {showResult && option === currentQuestion.correct_answer && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    )}
                    {showResult && selectedAnswer === option && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Geben Sie Ihre Antwort ein..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={showResult}
                  className={`text-lg p-4 ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : ''
                  }`}
                />
                {showResult && (
                  <div className="text-sm text-gray-600">
                    {isCorrect ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Richtig!</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span>Falsch!</span>
                        </div>
                        <p>Die richtige Antwort ist: <strong>{currentQuestion.correct_answer}</strong></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!showResult ? (
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={currentQuestion?.question_type === 'multiple_choice' ? !selectedAnswer : !textAnswer}
            className="flex-1"
            size="lg"
          >
            Antwort bestätigen
          </Button>
        ) : (
          <Button 
            onClick={handleNextQuestion} 
            className="flex-1"
            size="lg"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Weiter' : 'Quiz beenden'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
