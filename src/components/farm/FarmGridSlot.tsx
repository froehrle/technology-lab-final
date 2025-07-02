import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Lock, Star } from 'lucide-react';

interface FarmGridSlotProps {
  slot: any;
  rowIndex: number;
  colIndex: number;
}

const FarmGridSlot: React.FC<FarmGridSlotProps> = ({ slot, rowIndex, colIndex }) => {
  if (!slot) {
    return (
      <div className="aspect-square rounded-lg border-2 border-dashed border-green-300/30 bg-green-100/20"></div>
    );
  }

  const isLocked = !slot.isOwned && !slot.canPurchase;
  const isOwned = slot.isOwned;
  const canBuy = slot.canPurchase && !slot.isOwned;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return 'bg-purple-500 text-white';
      case 'uncommon':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'building':
        return 'from-stone-400 to-stone-600';
      case 'animal':
        return 'from-green-400 to-green-600';
      case 'equipment':
        return 'from-yellow-400 to-orange-500';
      case 'crop':
        return 'from-lime-400 to-green-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-square rounded-lg border-2 transition-all duration-300 group overflow-hidden",
        isOwned
          ? "border-green-400 bg-white/90 shadow-lg hover:shadow-xl"
          : canBuy
          ? "border-yellow-400 bg-yellow-50/50 hover:bg-yellow-100/70 cursor-pointer"
          : "border-gray-300 bg-gray-100/30"
      )}
      style={{
        transform: `translateY(${rowIndex * 2}px)`, // Depth effect
      }}
    >
      {/* Item Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        {/* Item Icon */}
        <div
          className={cn(
            "text-2xl mb-1 transition-transform group-hover:scale-110",
            isLocked && "grayscale opacity-50"
          )}
        >
          {slot.icon}
        </div>

        {/* Item Name */}
        <div className={cn(
          "text-xs font-medium text-center leading-tight",
          isOwned ? "text-foreground" : canBuy ? "text-yellow-700" : "text-gray-500"
        )}>
          {slot.name}
        </div>

        {/* Price for purchasable items */}
        {canBuy && (
          <div className="text-xs font-bold text-yellow-600 mt-1">
            {slot.price} 🪙
          </div>
        )}
      </div>

      {/* Status Overlays */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <Lock className="h-4 w-4 text-gray-600" />
        </div>
      )}

      {isOwned && (
        <div className="absolute top-1 right-1">
          <Badge variant="secondary" className="h-5 px-1 text-xs">
            ✓
          </Badge>
        </div>
      )}

      {canBuy && (
        <div className="absolute top-1 left-1">
          <Badge className={cn("h-5 px-1 text-xs", getRarityColor(slot.rarity))}>
            <Star className="h-3 w-3" />
          </Badge>
        </div>
      )}

      {/* Hover Effect */}
      {(isOwned || canBuy) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-black/10 transition-all duration-200"></div>
      )}

      {/* Type Indicator */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
        getTypeGradient(slot.type)
      )}></div>
    </div>
  );
};

export default FarmGridSlot;