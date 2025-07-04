import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUserRoleSync } from '@/utils/roleValidation';
import { User } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  displayName: string;
  totalXP: number;
  isCurrentUser: boolean;
  avatarUrl: string | null;
  equippedTitle: string | null;
  equippedAvatarFrame: string | null;
  isAnonymized: boolean;
}

export const useLeaderboardData = (user: User | null) => {
  const userRole = getUserRoleSync(user);

  return useQuery({
    queryKey: ['leaderboard', userRole],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // Get all student XP data
      const { data: xpData, error: xpError } = await supabase
        .from('student_xp')
        .select('student_id, total_xp')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (xpError) throw xpError;
      if (!xpData?.length) return [];

      // For teachers, only get XP data (anonymized view)
      // For students, get full profile and badge data
      let profiles = null;
      let badgePurchases = null;
      let avatarPurchases = null;

      if (userRole === 'student') {
        // Get profile information for all students
        const studentIds = xpData.map(student => student.student_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, avatar_url')
          .in('id', studentIds);

        if (profilesError) throw profilesError;
        profiles = profilesData;

        // Get equipped titles and badges for all students
        const { data: badgePurchasesData, error: badgesError } = await supabase
          .from('student_badge_purchases')
          .select(`
            student_id,
            is_equipped,
            profile_badges (name, badge_type)
          `)
          .eq('is_equipped', true)
          .in('student_id', studentIds);

        if (badgesError) throw badgesError;
        badgePurchases = badgePurchasesData;

        // Get equipped avatar items for all students
        const { data: avatarPurchasesData, error: avatarError } = await supabase
          .from('student_purchases')
          .select(`
            student_id,
            is_equipped,
            avatar_items (css_class, type)
          `)
          .eq('is_equipped', true)
          .eq('purchase_type', 'avatar_item')
          .in('student_id', studentIds);

        if (avatarError) throw avatarError;
        avatarPurchases = avatarPurchasesData;
      }

      // Combine XP data with profile information or anonymize for teachers
      return xpData.map((student, index) => {
        if (userRole === 'teacher') {
          // Anonymized view for teachers
          return {
            rank: index + 1,
            studentId: student.student_id,
            displayName: `Student #${index + 1}`,
            totalXP: student.total_xp,
            isCurrentUser: false,
            avatarUrl: null,
            equippedTitle: null,
            equippedAvatarFrame: null,
            isAnonymized: true
          };
        } else {
          // Full view for students
          const profile = profiles?.find(p => p.id === student.student_id);
          const equippedBadges = badgePurchases?.filter(p => p.student_id === student.student_id) || [];
          const equippedTitle = equippedBadges.find(b => b.profile_badges?.badge_type === 'title')?.profile_badges?.name;
          const equippedAvatarFrame = avatarPurchases?.find(p => p.student_id === student.student_id && p.avatar_items?.type === 'frame')?.avatar_items?.css_class;
          
          return {
            rank: index + 1,
            studentId: student.student_id,
            displayName: profile?.display_name || profile?.email?.split('@')[0] || 'Unbekannter Student',
            totalXP: student.total_xp,
            isCurrentUser: student.student_id === user?.id,
            avatarUrl: profile?.avatar_url,
            equippedTitle,
            equippedAvatarFrame,
            isAnonymized: false
          };
        }
      });
    },
    enabled: !!user?.id,
  });
};