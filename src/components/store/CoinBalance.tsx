import React from 'react';
import { useCoins } from '@/hooks/useCoins';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';

const CoinBalance = ({ className }: { className?: string }) => {
  const { coins, loading } = useCoins();

  if (loading) {
    return (
      <Badge variant="secondary" className={className}>
        <Coins className="h-4 w-4 mr-1" />
        ...
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      <Coins className="h-4 w-4 mr-1" />
      {coins?.total_coins || 0}
    </Badge>
  );
};

export default CoinBalance;