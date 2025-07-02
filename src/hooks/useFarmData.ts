import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FarmItem, FarmPurchase } from '@/types/farmTypes';

export const useFarmData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [farmItems, setFarmItems] = useState<FarmItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<FarmPurchase[]>([]);
  const [loading, setLoading] = useState(true);

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

  const refetch = () => {
    fetchFarmItems();
    fetchOwnedItems();
  };

  useEffect(() => {
    if (user) {
      fetchFarmItems();
      fetchOwnedItems();
    }
  }, [user]);

  return {
    farmItems,
    ownedItems,
    loading,
    refetch,
    fetchOwnedItems,
  };
};