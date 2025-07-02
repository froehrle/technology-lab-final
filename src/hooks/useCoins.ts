import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoinData {
  total_coins: number;
}

export const useCoins = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coins, setCoins] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCoins();
    }
  }, [user]);

  const fetchCoins = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_coins')
        .select('total_coins')
        .eq('student_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no record exists, create one with 0 coins
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('student_coins')
          .insert({ student_id: user.id, total_coins: 0 })
          .select('total_coins')
          .single();

        if (insertError) throw insertError;
        setCoins(newData);
      } else {
        setCoins(data);
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
      toast({
        title: "Fehler",
        description: "Münzen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const spendCoins = async (amount: number) => {
    if (!user || !coins) return { success: false, error: 'No user or coins data' };

    if (coins.total_coins < amount) {
      toast({
        title: "Nicht genug Münzen",
        description: `Du benötigst ${amount} Münzen, hast aber nur ${coins.total_coins}.`,
        variant: "destructive",
      });
      return { success: false, error: 'Insufficient coins' };
    }

    try {
      const { error } = await supabase
        .from('student_coins')
        .update({ 
          total_coins: coins.total_coins - amount,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', user.id);

      if (error) throw error;

      setCoins(prev => prev ? { ...prev, total_coins: prev.total_coins - amount } : null);
      
      toast({
        title: "Kauf erfolgreich!",
        description: `${amount} Münzen ausgegeben.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error spending coins:', error);
      toast({
        title: "Fehler beim Kauf",
        description: "Der Kauf konnte nicht abgeschlossen werden.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    coins,
    loading,
    spendCoins,
    refetch: fetchCoins
  };
};