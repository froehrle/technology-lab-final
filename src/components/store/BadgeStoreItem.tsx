import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Lock } from 'lucide-react';
import { ProfileBadgeData } from '@/components/profile/ProfileBadge';
import { cn } from '@/lib/utils';

interface BadgeStoreItemProps {
  badge: ProfileBadgeData;
  isOwned: boolean;
  isEquipped: boolean;
  onPurchase: () => void;
  onEquip: () => void;
  onUnequip: () => void;
  canAfford: boolean;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'rare': return 'bg-blue-500';
    case 'epic': return 'bg-purple-500';
    case 'legendary': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const BadgeStoreItem = ({ 
  badge, 
  isOwned, 
  isEquipped, 
  onPurchase, 
  onEquip, 
  onUnequip, 
  canAfford 
}: BadgeStoreItemProps) => {
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{badge.name}</CardTitle>
          <Badge className={cn("text-white", getRarityColor(badge.rarity))}>
            {badge.rarity}
          </Badge>
        </div>
        <CardDescription>{badge.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview Badge */}
        <div className="flex justify-center p-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{badge.icon}</span>
            <Badge 
              className={cn("text-white", getRarityColor(badge.rarity))}
              variant="secondary"
            >
              {badge.name}
            </Badge>
          </div>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-center">
          {badge.is_purchasable ? (
            <Badge variant="outline" className="px-3 py-1">
              <Coins className="h-4 w-4 mr-1" />
              {badge.price}
            </Badge>
          ) : (
            <Badge variant="outline" className="px-3 py-1">
              <Lock className="h-4 w-4 mr-1" />
              Verdienen
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {!badge.is_purchasable ? (
          <Button 
            disabled
            variant="outline"
            className="w-full"
          >
            <Lock className="h-4 w-4 mr-2" />
            Durch Leistung verdienen
          </Button>
        ) : !isOwned ? (
          <Button 
            onClick={onPurchase}
            disabled={!canAfford}
            className="w-full"
          >
            <Coins className="h-4 w-4 mr-2" />
            Kaufen
          </Button>
        ) : isEquipped ? (
          <Button 
            onClick={onUnequip}
            variant="outline"
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Ausgerüstet
          </Button>
        ) : (
          <Button 
            onClick={onEquip}
            className="w-full"
          >
            Ausrüsten
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BadgeStoreItem;