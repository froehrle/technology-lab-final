import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserRoleSync } from '@/utils/roleValidation';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { LeaderboardHeader } from '@/components/leaderboard/LeaderboardHeader';
import { LeaderboardItem } from '@/components/leaderboard/LeaderboardItem';

const Leaderboard = () => {
  const { user } = useAuth();
  const userRole = getUserRoleSync(user);
  const { data: leaderboard = [], isLoading, error } = useLeaderboardData(user);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Fehler beim Laden der Rangliste. Bitte versuchen Sie es erneut.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LeaderboardHeader userRole={userRole} />

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((student, index) => (
                <LeaderboardItem
                  key={student.studentId}
                  student={student}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Noch keine XP-Daten verfügbar. Beginne mit einem Quiz um XP zu sammeln!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;