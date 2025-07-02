import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AvatarItem {
  id: string;
  name: string;
  type: 'frame';
  css_class: string;
  price: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StudentPurchase {
  id: string;
  item_id: string;
  is_equipped: boolean;
  avatar_items: AvatarItem;
}

export const useAvatarItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<AvatarItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<StudentPurchase[]>([]);
  const [equippedItems, setEquippedItems] = useState<{
    frame?: string;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchItems();
      fetchOwnedItems();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('avatar_items')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setAllItems((data as AvatarItem[]) || []);
    } catch (error) {
      console.error('Error fetching avatar items:', error);
    }
  };

  const fetchOwnedItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_purchases')
        .select(`
          id,
          item_id,
          is_equipped,
          avatar_items (*)
        `)
        .eq('student_id', user.id)
        .eq('purchase_type', 'avatar_item');

      if (error) throw error;
      
      const purchases = data as any[] || [];
      setOwnedItems(purchases);

      // Set equipped items - only frames now
      const equipped: any = {};
      purchases.forEach(purchase => {
        if (purchase.is_equipped && purchase.avatar_items) {
          if (purchase.avatar_items.type === 'frame') {
            equipped.frame = purchase.avatar_items.css_class;
          }
        }
      });
      setEquippedItems(equipped);
    } catch (error) {
      console.error('Error fetching owned items:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (item: AvatarItem) => {
    if (!user) return { success: false, error: 'No user' };

    try {
      const { error } = await supabase
        .from('student_purchases')
        .insert({
          student_id: user.id,
          item_id: item.id,
          purchase_type: 'avatar_item',
          is_equipped: false
        });

      if (error) throw error;

      toast({
        title: "Item gekauft!",
        description: `${item.name} wurde erfolgreich gekauft.`,
      });

      await fetchOwnedItems();
      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Kauffehler",
        description: "Das Item konnte nicht gekauft werden.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const equipItem = async (purchaseId: string, itemType: string) => {
    if (!user) return;

    try {
      // First, unequip any currently equipped item of the same type
      await supabase
        .from('student_purchases')
        .update({ is_equipped: false })
        .eq('student_id', user.id)
        .eq('purchase_type', 'avatar_item')
        .in('item_id', allItems.filter(item => item.type === 'frame').map(item => item.id));

      // Then equip the selected item
      const { error } = await supabase
        .from('student_purchases')
        .update({ is_equipped: true })
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Item ausgerüstet!",
        description: "Dein Avatar wurde aktualisiert.",
      });

      await fetchOwnedItems();
    } catch (error) {
      console.error('Error equipping item:', error);
      toast({
        title: "Fehler",
        description: "Das Item konnte nicht ausgerüstet werden.",
        variant: "destructive",
      });
    }
  };

  const unequipItem = async (purchaseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('student_purchases')
        .update({ is_equipped: false })
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Item entfernt",
        description: "Das Item wurde von deinem Avatar entfernt.",
      });

      await fetchOwnedItems();
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  const isOwned = (itemId: string) => {
    return ownedItems.some(purchase => purchase.item_id === itemId);
  };

  const getFrames = () => {
    return allItems.filter(item => item.type === 'frame');
  };

  return {
    allItems,
    ownedItems,
    equippedItems,
    loading,
    purchaseItem,
    equipItem,
    unequipItem,
    isOwned,
    getFrames,
    refetch: fetchOwnedItems
  };
};