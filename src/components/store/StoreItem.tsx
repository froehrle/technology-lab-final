import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Coins, Check } from 'lucide-react';
import { AvatarItem } from '@/hooks/useAvatarItems';
import { cn } from '@/lib/utils';

interface StoreItemProps {
  item: AvatarItem;
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

const StoreItem = ({ 
  item, 
  isOwned, 
  isEquipped, 
  onPurchase, 
  onEquip, 
  onUnequip, 
  canAfford 
}: StoreItemProps) => {
  console.log('StoreItem css_class:', item.css_class);
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge className={cn("text-white", getRarityColor(item.rarity))}>
            {item.rarity}
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview Avatar */}
        <div className="flex justify-center p-8">
          <div className={cn(
            "relative inline-block", // Changed to inline-block for proper sizing
            item.css_class, // Apply ring classes to container
            item.css_class ? "p-1" : "" // Add padding when ring is present
          )}>
            <Avatar className="h-20 w-20 relative overflow-hidden bg-muted">
              <AvatarFallback className="font-medium text-lg">A</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="px-3 py-1">
            <Coins className="h-4 w-4 mr-1" />
            {item.price}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter>
        {!isOwned ? (
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

export default StoreItem;