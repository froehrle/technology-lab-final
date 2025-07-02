import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfileBadgeData } from '@/components/profile/ProfileBadge';

export interface BadgePurchase {
  id: string;
  badge_id: string;
  is_equipped: boolean;
  profile_badges: ProfileBadgeData;
}

export const useProfileBadges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allBadges, setAllBadges] = useState<ProfileBadgeData[]>([]);
  const [ownedBadges, setOwnedBadges] = useState<BadgePurchase[]>([]);
  const [equippedTitle, setEquippedTitle] = useState<ProfileBadgeData | null>(null);
  const [equippedBadges, setEquippedBadges] = useState<ProfileBadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllBadges();
      fetchOwnedBadges();
    }
  }, [user]);

  const fetchAllBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_badges')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setAllBadges((data as ProfileBadgeData[]) || []);
    } catch (error) {
      console.error('Error fetching profile badges:', error);
    }
  };

  const fetchOwnedBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_badge_purchases')
        .select(`
          id,
          badge_id,
          is_equipped,
          profile_badges (*)
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      
      const purchases = data as any[] || [];
      setOwnedBadges(purchases);

      // Set equipped badges
      const equipped = purchases
        .filter(p => p.is_equipped && p.profile_badges)
        .map(p => p.profile_badges);
      
      setEquippedTitle(equipped.find(b => b.badge_type === 'title') || null);
      setEquippedBadges(equipped.filter(b => b.badge_type === 'badge'));
    } catch (error) {
      console.error('Error fetching owned badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseBadge = async (badge: ProfileBadgeData) => {
    if (!user) return { success: false, error: 'No user' };

    try {
      const { error } = await supabase
        .from('student_badge_purchases')
        .insert({
          student_id: user.id,
          badge_id: badge.id,
          is_equipped: false
        });

      if (error) throw error;

      toast({
        title: "Badge gekauft!",
        description: `${badge.name} wurde erfolgreich gekauft.`,
      });

      await fetchOwnedBadges();
      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing badge:', error);
      toast({
        title: "Kauffehler",
        description: "Das Badge konnte nicht gekauft werden.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const equipBadge = async (purchaseId: string, badgeType: 'title' | 'badge') => {
    if (!user) return;

    try {
      // For titles, unequip any currently equipped title
      if (badgeType === 'title') {
        await supabase
          .from('student_badge_purchases')
          .update({ is_equipped: false })
          .eq('student_id', user.id)
          .in('badge_id', allBadges.filter(b => b.badge_type === 'title').map(b => b.id));
      }

      // Equip the selected badge
      const { error } = await supabase
        .from('student_badge_purchases')
        .update({ is_equipped: true })
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Badge ausgerüstet!",
        description: "Dein Profil wurde aktualisiert.",
      });

      await fetchOwnedBadges();
    } catch (error) {
      console.error('Error equipping badge:', error);
      toast({
        title: "Fehler",
        description: "Das Badge konnte nicht ausgerüstet werden.",
        variant: "destructive",
      });
    }
  };

  const unequipBadge = async (purchaseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('student_badge_purchases')
        .update({ is_equipped: false })
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Badge entfernt",
        description: "Das Badge wurde von deinem Profil entfernt.",
      });

      await fetchOwnedBadges();
    } catch (error) {
      console.error('Error unequipping badge:', error);
    }
  };

  const isOwned = (badgeId: string) => {
    return ownedBadges.some(purchase => purchase.badge_id === badgeId);
  };

  const getBadgesByType = (type: 'title' | 'badge') => {
    return allBadges.filter(badge => badge.badge_type === type);
  };

  return {
    allBadges,
    ownedBadges,
    equippedTitle,
    equippedBadges,
    loading,
    purchaseBadge,
    equipBadge,
    unequipBadge,
    isOwned,
    getBadgesByType,
    refetch: fetchOwnedBadges
  };
};