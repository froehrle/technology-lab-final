
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Crown, 
  Zap,
  Lock
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
}

interface StudentAchievement {
  achievement_id: string;
  earned_at: string;
  achievements: Achievement;
}

const iconMap = {
  'star': Star,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'crown': Crown,
  'zap': Zap,
};

const AchievementsDisplay = () => {
  const { user } = useAuth();

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_required', { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });

  const { data: studentAchievements = [] } = useQuery({
    queryKey: ['student-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('student_achievements')
        .select(`
          achievement_id,
          earned_at,
          achievements (
            id,
            name,
            description,
            icon,
            xp_required
          )
        `)
        .eq('student_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as StudentAchievement[];
    },
    enabled: !!user?.id,
  });

  const { data: studentXP } = useQuery({
    queryKey: ['student-xp', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('student_xp')
        .select('total_xp')
        .eq('student_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const earnedAchievementIds = new Set(studentAchievements.map(sa => sa.achievement_id));
  const currentXP = studentXP?.total_xp || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Erfolge
        </CardTitle>
        <CardDescription>Ihre Errungenschaften und Fortschritte</CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Keine Erfolge verfügbar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const isEarned = earnedAchievementIds.has(achievement.id);
              const canEarn = currentXP >= achievement.xp_required;
              const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Star;
              
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isEarned 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : canEarn 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isEarned 
                      ? 'bg-yellow-200 text-yellow-700' 
                      : canEarn 
                        ? 'bg-blue-200 text-blue-700' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isEarned || canEarn ? (
                      <IconComponent className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{achievement.name}</h4>
                      {isEarned && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          Erreicht!
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Benötigt: {achievement.xp_required} XP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {studentAchievements.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-sm mb-3 text-gray-700">
              Zuletzt erreichte Erfolge:
            </h4>
            <div className="space-y-2">
              {studentAchievements.slice(0, 3).map((sa) => (
                <div key={sa.achievement_id} className="flex items-center gap-2 text-xs text-gray-600">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span className="font-medium">{sa.achievements.name}</span>
                  <span>•</span>
                  <span>{new Date(sa.earned_at).toLocaleDateString('de-DE')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementsDisplay;
