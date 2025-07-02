import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FarmItem, FarmPurchase } from '@/types/farmTypes';

export const useFarmPurchases = (
  farmItems: FarmItem[], 
  ownedItems: FarmPurchase[], 
  fetchOwnedItems: () => Promise<void>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

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

  return {
    purchaseItem,
    isOwned,
    canPurchase,
  };
};