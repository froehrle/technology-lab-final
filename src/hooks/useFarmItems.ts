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
  custom_grid_x?: number | null;
  custom_grid_y?: number | null;
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
      const purchase = ownedItems.find(p => p.farm_item_id === item.id);
      if (purchase) {
        // Use custom position if available, otherwise use default position
        const gridX = purchase.custom_grid_x !== null ? purchase.custom_grid_x : item.grid_x;
        const gridY = purchase.custom_grid_y !== null ? purchase.custom_grid_y : item.grid_y;
        
        if (grid[gridY] && grid[gridY][gridX] === null) {
          const itemWithStatus = {
            ...item,
            isOwned: true,
            canPurchase: canPurchase(item),
            currentGridX: gridX,
            currentGridY: gridY,
            purchaseId: purchase.id
          };
          
          grid[gridY][gridX] = itemWithStatus;
        }
      }
    });

    return grid;
  };

  const moveItem = async (itemId: string, newRow: number, newCol: number) => {
    if (!user) return { success: false, error: 'No user' };

    try {
      // Find the purchase record for this item
      const purchase = ownedItems.find(p => p.farm_item_id === itemId);
      if (!purchase) return { success: false, error: 'Item not purchased' };

      // Find the item details for the toast message
      const item = farmItems.find(item => item.id === itemId);
      if (!item) return { success: false, error: 'Item not found' };

      // Update the user's custom position for this item
      const { error } = await supabase
        .from('student_farm_purchases')
        .update({ 
          custom_grid_x: newCol, 
          custom_grid_y: newRow 
        })
        .eq('id', purchase.id)
        .eq('student_id', user.id);

      if (error) throw error;

      // Refresh the data
      await fetchOwnedItems();
      
      toast({
        title: "Verschoben!",
        description: `${item.name} wurde erfolgreich verschoben.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error moving farm item:', error);
      toast({
        title: "Verschieben fehlgeschlagen",
        description: "Der Gegenstand konnte nicht verschoben werden.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
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
    moveItem,
    refetch: () => {
      fetchFarmItems();
      fetchOwnedItems();
    }
  };
};