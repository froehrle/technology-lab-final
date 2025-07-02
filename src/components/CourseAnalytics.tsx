import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CourseAnalytics = () => {
  const { user } = useAuth();

  // Get all courses for the teacher to use in other queries
  const { data: courses = [] } = useQuery({
    queryKey: ['teacher-courses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('teacher_id', user?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const courseIds = courses.map(course => course.id);

  // Total enrolled students across all courses
  const { data: totalEnrollments = 0 } = useQuery({
    queryKey: ['analytics-enrollments', user?.id, courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return 0;
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .in('course_id', courseIds);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id && courseIds.length > 0,
  });

  // Total quiz attempts
  const { data: totalQuizAttempts = 0 } = useQuery({
    queryKey: ['analytics-attempts', user?.id, courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return 0;
      
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id')
        .in('course_id', courseIds);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id && courseIds.length > 0,
  });

  // Perfect completions (100% correct answers)
  const { data: perfectCompletions = 0 } = useQuery({
    queryKey: ['analytics-perfect', user?.id, courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return 0;
      
      // Get completed quiz attempts
      const { data: completedAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('id, student_id, course_id')
        .in('course_id', courseIds)
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
    enabled: !!user?.id && courseIds.length > 0,
  });

  // Most difficult questions (highest attempt count or most wrong answers)
  const { data: difficultQuestions = [] } = useQuery({
    queryKey: ['analytics-difficult', user?.id, courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      
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
        .in('questions.course_id', courseIds);

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
    enabled: !!user?.id && courseIds.length > 0,
  });

  if (!user?.id || courseIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kurs Analytics</CardTitle>
          <CardDescription>Umfassende Statistiken zu Ihren Kursen</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Erstellen Sie zunächst einen Kurs, um Analytics zu sehen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kurs Analytics</CardTitle>
        <CardDescription>Umfassende Statistiken zu Ihren Kursen</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eingeschriebene Studenten</p>
              <p className="text-2xl font-bold">{totalEnrollments}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quiz-Versuche</p>
              <p className="text-2xl font-bold">{totalQuizAttempts}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Perfekte Abschlüsse</p>
              <p className="text-2xl font-bold">{perfectCompletions}</p>
            </div>
          </div>
        </div>

        {/* Difficult Questions */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Schwierigste Fragen</h3>
          </div>
          
          {difficultQuestions.length > 0 ? (
            <div className="space-y-3">
              {difficultQuestions.map((question: any, index: number) => (
                <div key={question.questionId} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Badge variant="secondary">{question.courseTitle}</Badge>
                      </div>
                      <p className="text-sm font-medium mb-2">
                        {question.questionText.length > 100 
                          ? `${question.questionText.substring(0, 100)}...` 
                          : question.questionText}
                      </p>
                      <div className="flex space-x-4 text-xs text-muted-foreground">
                        <span>Falsche Antworten: {question.wrongPercentage.toFixed(1)}%</span>
                        <span>Ø Versuche: {question.avgAttempts.toFixed(1)}</span>
                        <span>Gesamt Antworten: {question.totalAnswers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Noch keine Daten zu schwierigen Fragen verfügbar.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseAnalytics;