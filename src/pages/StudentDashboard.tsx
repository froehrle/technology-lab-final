
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AchievementsDisplay from '@/components/AchievementsDisplay';
import DashboardStats from '@/components/dashboard/DashboardStats';
import CoursesList from '@/components/dashboard/CoursesList';
import { useStudentData } from '@/hooks/useStudentData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { enrollments, courseStats, studentXP, isLoading } = useStudentData(user?.id);
  const { profile } = useProfile();

  const averageProgress = enrollments.length > 0 
    ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length
    : 0;

  // Debug: Log XP data
  React.useEffect(() => {
    console.log('Current XP data:', studentXP);
  }, [studentXP]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Willkommen zurück, {user?.user_metadata?.display_name || user?.email}!
            </h1>
            <p className="text-gray-600 mt-1">Setzen Sie Ihre Lernreise fort</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <DashboardStats 
          enrollmentsCount={enrollments.length}
          totalXP={studentXP?.total_xp || 0}
          averageProgress={averageProgress}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoursesList 
          enrollments={enrollments}
          courseStats={courseStats}
          isLoading={isLoading}
        />
        <AchievementsDisplay />
      </div>
    </div>
  );
};

export default StudentDashboard;
