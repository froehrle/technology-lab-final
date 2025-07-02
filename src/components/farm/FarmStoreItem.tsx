import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ShoppingCart, CheckCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FarmItem } from '@/types/farmTypes';

interface FarmStoreItemProps {
  item: FarmItem;
  isOwned: boolean;
  canPurchase: boolean;
  onPurchase: () => void;
  canAfford: boolean;
}

const FarmStoreItem: React.FC<FarmStoreItemProps> = ({
  item,
  isOwned,
  canPurchase,
  onPurchase,
  canAfford
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return 'border-purple-500 bg-purple-50';
      case 'uncommon':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Gebäude':
      case 'building':
        return '🏠';
      case 'Tier':
      case 'animal':
        return '🐄';
      case 'Ausrüstung':
      case 'equipment':
        return '🚜';
      case 'Feld':
      case 'crop':
        return '🌾';
      default:
        return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Gebäude':
      case 'building':
        return 'bg-stone-100 text-stone-700';
      case 'Tier':
      case 'animal':
        return 'bg-green-100 text-green-700';
      case 'Ausrüstung':
      case 'equipment':
        return 'bg-yellow-100 text-yellow-700';
      case 'Feld':
      case 'crop':
        return 'bg-lime-100 text-lime-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
      getRarityColor(item.rarity || 'common'),
      isOwned && "ring-2 ring-green-500 ring-opacity-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={cn("text-xs", getTypeColor(item.type))}>
                  {getTypeIcon(item.type)} {item.type}
                </Badge>
              </div>
            </div>
          </div>
          
          {isOwned && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
        
        <CardDescription className="text-sm">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-foreground/70">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-primary">#{item.purchase_order}</span>
              <span>in Reihenfolge</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>({item.grid_x + 1}, {item.grid_y + 1})</span>
            </div>
          </div>
          <div className="text-lg font-bold text-primary">
            {item.price} 🪙
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {isOwned ? (
          <Button disabled className="w-full" variant="secondary">
            <CheckCircle className="h-4 w-4 mr-2" />
            Besitzen
          </Button>
        ) : !canPurchase ? (
          <Button disabled className="w-full" variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Gesperrt
          </Button>
        ) : !canAfford ? (
          <Button disabled className="w-full" variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nicht genug Münzen
          </Button>
        ) : (
          <Button 
            onClick={onPurchase}
            className="w-full"
            variant="default"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Kaufen
          </Button>
        )}
      </CardFooter>

      {/* Rarity glow effect */}
      {item.rarity === 'rare' && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
      )}
      {item.rarity === 'uncommon' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 pointer-events-none"></div>
      )}
    </Card>
  );
};

export default FarmStoreItem;