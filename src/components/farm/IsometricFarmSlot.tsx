import React from 'react';
import { cn } from '@/lib/utils';

interface IsometricFarmSlotProps {
  slot: any;
  rowIndex: number;
  colIndex: number;
  isEmpty: boolean;
}

const IsometricFarmSlot: React.FC<IsometricFarmSlotProps> = ({ 
  slot, 
  rowIndex, 
  colIndex, 
  isEmpty
}) => {
  // Empty slot - show subtle grid indication
  if (isEmpty) {
    return (
      <div className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-white/20">
        {/* Empty grid slot */}
      </div>
    );
  }

  // Don't render anything for span cells (cells occupied by multi-cell items but not the main cell)
  if (slot?.isSpan) {
    return <div className="relative" />;
  }

  const getSlotState = () => {
    if (slot.isOwned) return 'owned';
    if (slot.isNextAvailable) return 'next';
    return 'locked';
  };

  const slotState = getSlotState();

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center group transition-all duration-500",
        "rounded-xl border-2 p-2",
        slotState === 'owned' && "border-green-400/60 bg-green-50/30 shadow-lg animate-scale-in",
        slotState === 'next' && "border-yellow-400/80 bg-yellow-50/40 shadow-lg animate-pulse",
        slotState === 'locked' && "border-gray-300/40 bg-gray-50/20"
      )}
      style={{
        gridColumn: `span ${slot.width || 1}`,
        gridRow: `span ${slot.height || 1}`,
        aspectRatio: (slot.width || 1) / (slot.height || 1),
      }}
    >
      {/* Purchase Order Badge */}
      <div className={cn(
        "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10",
        slotState === 'owned' && "bg-green-500 text-white",
        slotState === 'next' && "bg-yellow-500 text-white animate-bounce",
        slotState === 'locked' && "bg-gray-400 text-white"
      )}>
        {slot.purchase_order}
      </div>

      {/* Item Icon */}
      <div
        className={cn(
          "transition-all duration-300 rounded-lg p-1",
          "flex items-center justify-center w-full h-full",
          slotState === 'owned' && "group-hover:scale-110",
          slotState === 'locked' && "opacity-40 grayscale"
        )}
        title={`${slot.name} (${slotState === 'owned' ? 'Besitzt' : slotState === 'next' ? 'Als Nächstes' : 'Gesperrt'})`}
      >
        <span 
          className={cn(
            "transition-all duration-300",
            slot.width > 1 || slot.height > 1 ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl",
            slotState === 'next' && "animate-pulse"
          )}
        >
          {slot.icon}
        </span>
      </div>

      {/* Next Available Indicator */}
      {slotState === 'next' && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
          NEXT
        </div>
      )}

      {/* Lock Icon for Locked Items */}
      {slotState === 'locked' && (
        <div className="absolute top-1 right-1 text-gray-400">
          🔒
        </div>
      )}

      {/* Rarity Glow Effects for Owned Items */}
      {slotState === 'owned' && slot.rarity === 'rare' && (
        <div className="absolute inset-0 bg-purple-400/20 rounded-xl blur-sm animate-pulse pointer-events-none" />
      )}
      {slotState === 'owned' && slot.rarity === 'uncommon' && (
        <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-sm animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default IsometricFarmSlot;