import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FarmItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  grid_x: number;
  grid_y: number;
  icon: string;
  rarity: string | null;
  prerequisite_item_id: string | null;
  created_at: string;
}

export interface FarmPurchase {
  id: string;
  student_id: string;
  farm_item_id: string;
  purchased_at: string;
  is_placed: boolean;
}

export const useFarmItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [farmItems, setFarmItems] = useState<FarmItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<FarmPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFarmItems();
      fetchOwnedItems();
    }
  }, [user]);

  const fetchFarmItems = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_items')
        .select('*')
        .order('grid_y')
        .order('grid_x');

      if (error) throw error;
      setFarmItems(data || []);
    } catch (error) {
      console.error('Error fetching farm items:', error);
      toast({
        title: "Fehler",
        description: "Farm-Gegenstände konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const fetchOwnedItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_farm_purchases')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;
      setOwnedItems(data || []);
    } catch (error) {
      console.error('Error fetching owned items:', error);
      toast({
        title: "Fehler",
        description: "Besitzende Gegenstände konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (item: FarmItem) => {
    if (!user) return { success: false, error: 'No user' };

    try {
      const { error } = await supabase
        .from('student_farm_purchases')
        .insert({
          student_id: user.id,
          farm_item_id: item.id,
          is_placed: true
        });

      if (error) throw error;

      // Refresh owned items
      await fetchOwnedItems();

      toast({
        title: "Gekauft!",
        description: `${item.name} wurde erfolgreich gekauft.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing farm item:', error);
      toast({
        title: "Kauf fehlgeschlagen",
        description: "Der Gegenstand konnte nicht gekauft werden.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const isOwned = (itemId: string) => {
    return ownedItems.some(purchase => purchase.farm_item_id === itemId);
  };

  const canPurchase = (item: FarmItem) => {
    // Check if already owned
    if (isOwned(item.id)) return false;

    // Check prerequisite
    if (item.prerequisite_item_id) {
      return isOwned(item.prerequisite_item_id);
    }

    return true;
  };

  const getFarmItemsByType = (type: string) => {
    return farmItems.filter(item => item.type === type);
  };

  const getGridLayout = () => {
    const grid = Array(4).fill(null).map(() => Array(6).fill(null));
    
    farmItems.forEach(item => {
      if (grid[item.grid_y] && grid[item.grid_y][item.grid_x] === null) {
        grid[item.grid_y][item.grid_x] = {
          ...item,
          isOwned: isOwned(item.id),
          canPurchase: canPurchase(item)
        };
      }
    });

    return grid;
  };

  return {
    farmItems,
    ownedItems,
    loading,
    purchaseItem,
    isOwned,
    canPurchase,
    getFarmItemsByType,
    getGridLayout,
    refetch: () => {
      fetchFarmItems();
      fetchOwnedItems();
    }
  };
};