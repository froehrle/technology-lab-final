import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Leaderboard = () => {
  const { user } = useAuth();

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get all student XP data
      const { data: xpData, error: xpError } = await supabase
        .from('student_xp')
        .select('student_id, total_xp')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (xpError) throw xpError;
      if (!xpData?.length) return [];

      // Get profile information for all students
      const studentIds = xpData.map(student => student.student_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Combine XP data with profile information
      return xpData.map((student, index) => {
        const profile = profiles?.find(p => p.id === student.student_id);
        return {
          rank: index + 1,
          studentId: student.student_id,
          displayName: profile?.display_name || profile?.email?.split('@')[0] || 'Unbekannter Student',
          totalXP: student.total_xp,
          isCurrentUser: student.student_id === user?.id
        };
      });
    },
    enabled: !!user?.id,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">XP Rangliste</h1>
        <p className="text-gray-600 mt-2">Siehe wie du im Vergleich zu anderen Studenten abschneidest</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Top Studenten</span>
          </CardTitle>
          <CardDescription>
            Basierend auf gesammelten XP-Punkten aus Quiz-Aktivitäten
          </CardDescription>
        </CardHeader>
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
                <div 
                  key={student.studentId}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all animate-fade-in ${
                    student.isCurrentUser 
                      ? 'bg-primary/5 border-primary shadow-md' 
                      : 'hover:bg-muted/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(student.rank)}
                      <Badge variant={getRankBadgeVariant(student.rank)}>
                        #{student.rank}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className={`font-medium ${student.isCurrentUser ? 'text-primary' : ''}`}>
                        {student.displayName}
                        {student.isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Du
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      student.rank === 1 ? 'text-yellow-600' :
                      student.rank === 2 ? 'text-gray-600' :
                      student.rank === 3 ? 'text-amber-600' :
                      'text-muted-foreground'
                    }`}>
                      {student.totalXP} XP
                    </p>
                  </div>
                </div>
              ))}
              
              {leaderboard.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine XP-Daten verfügbar. Beginne mit einem Quiz um XP zu sammeln!
                </p>
              )}
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