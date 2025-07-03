
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AchievementsDisplay from '@/components/AchievementsDisplay';
import DashboardStats from '@/components/dashboard/DashboardStats';
import CoursesList from '@/components/dashboard/CoursesList';
import { useStudentData } from '@/hooks/useStudentData';
import { useProfile } from '@/hooks/useProfile';
import CustomAvatar from '@/components/avatar/CustomAvatar';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { enrollments, courseStats, studentXP, studentStreak, isLoading } = useStudentData(user?.id);
  const { profile } = useProfile();

  const averageProgress = enrollments.length > 0 
    ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length
    : 0;

  // Debug: Log XP data
  React.useEffect(() => {
    console.log('Current XP data:', studentXP);
  }, [studentXP]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-achievement/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <CustomAvatar 
              src={profile?.avatar_url}
              fallback={user?.email?.charAt(0).toUpperCase() || 'U'}
              className="h-20 w-20 ring-4 ring-primary/20 shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-achievement bg-clip-text text-transparent">
                Willkommen zurück, {user?.user_metadata?.display_name || user?.email}!
              </h1>
              <p className="text-foreground/70 mt-1 font-medium">Setzen Sie Ihre Lernreise fort</p>
            </div>
          </div>
        </div>

      <div className="mb-8">
        <DashboardStats 
          enrollmentsCount={enrollments.length}
          totalXP={studentXP?.total_xp || 0}
          averageProgress={averageProgress}
          currentStreak={studentStreak?.current_streak || 0}
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
    </div>
  );
};

export default StudentDashboard;
