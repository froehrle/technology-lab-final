import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCourseAnalytics } from '@/hooks/useCourseAnalytics';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import OverviewStats from '@/components/analytics/OverviewStats';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import CourseDifficultyRanking from '@/components/analytics/CourseDifficultyRanking';
import DropoutPoints from '@/components/analytics/DropoutPoints';
import DifficultQuestions from '@/components/analytics/DifficultQuestions';

const CourseAnalytics = () => {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

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

  // Filter course IDs based on selection
  const filteredCourseIds = selectedCourseId === 'all' 
    ? courses.map(course => course.id)
    : [selectedCourseId];

  // Get all analytics data using the custom hook
  const analytics = useCourseAnalytics(user?.id, filteredCourseIds, courses);

  if (!user?.id || courses.length === 0) {
    return (
      <Card>
        <AnalyticsHeader 
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
          courses={courses}
        />
        <CardContent>
          <p className="text-muted-foreground">Erstellen Sie zunächst einen Kurs, um Analytics zu sehen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <AnalyticsHeader 
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        courses={courses}
      />
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <OverviewStats 
          totalEnrollments={analytics.totalEnrollments}
          totalQuizAttempts={analytics.totalQuizAttempts}
          perfectCompletions={analytics.perfectCompletions}
        />

        {/* Advanced Analytics */}
        <AdvancedAnalytics 
          completionRate={analytics.completionRate}
          avgSessionDuration={analytics.avgSessionDuration}
          avgAttemptsPerQuestion={analytics.avgAttemptsPerQuestion}
          difficultQuestionsCount={analytics.difficultQuestions.length}
        />

        {/* Course Difficulty Ranking */}
        <CourseDifficultyRanking 
          courseDifficultyRanking={analytics.courseDifficultyRanking}
        />

        {/* Dropout Points */}
        <DropoutPoints dropoutPoints={analytics.dropoutPoints} />

        {/* Difficult Questions */}
        <DifficultQuestions difficultQuestions={analytics.difficultQuestions} />
      </CardContent>
    </Card>
  );
};

export default CourseAnalytics;