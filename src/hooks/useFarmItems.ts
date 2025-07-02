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
  width: number;
  height: number;
  purchase_order: number;
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
        .order('purchase_order');

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

    // Must follow sequential purchase order - can only buy the next item in sequence
    const ownedItemIds = ownedItems.map(p => p.farm_item_id);
    const ownedFarmItems = farmItems.filter(fi => ownedItemIds.includes(fi.id));
    const highestOwnedOrder = ownedFarmItems.length > 0 
      ? Math.max(...ownedFarmItems.map(fi => fi.purchase_order)) 
      : 0;

    // Can purchase if this is the next item in sequence
    return item.purchase_order === highestOwnedOrder + 1;
  };

  const getFarmItemsByType = (type: string) => {
    return farmItems.filter(item => item.type === type);
  };

  const getGridLayout = () => {
    const grid = Array(5).fill(null).map(() => Array(8).fill(null));
    
    farmItems.forEach(item => {
      const purchase = ownedItems.find(p => p.farm_item_id === item.id);
      const isItemOwned = !!purchase;
      const isNextAvailable = canPurchase(item);
      
      // Place items in their fixed positions in the 8x5 grid
      if (item.grid_y < 5 && item.grid_x < 8) {
        const itemWithStatus = {
          ...item,
          isOwned: isItemOwned,
          isNextAvailable: isNextAvailable,
          isLocked: !isItemOwned && !isNextAvailable,
          purchaseId: purchase?.id
        };
        
        // For now, all items are 1x1, so just place them directly
        grid[item.grid_y][item.grid_x] = itemWithStatus;
      }
    });

    return grid;
  };

  const getNextPurchasableItem = () => {
    return farmItems.find(item => canPurchase(item));
  };

  const getPurchaseProgress = () => {
    const totalItems = farmItems.length;
    const ownedCount = ownedItems.length;
    return {
      owned: ownedCount,
      total: totalItems,
      percentage: totalItems > 0 ? Math.round((ownedCount / totalItems) * 100) : 0
    };
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
    getNextPurchasableItem,
    getPurchaseProgress,
    refetch: () => {
      fetchFarmItems();
      fetchOwnedItems();
    }
  };
};