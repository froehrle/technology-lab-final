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
  if (isEmpty) {
    return (
      <div className="relative aspect-square flex items-center justify-center">
        <div className="w-full h-full bg-amber-100/80 border-2 border-dashed border-amber-400/60 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
          <span className="text-amber-600 text-xl font-bold">+</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square flex items-center justify-center group cursor-pointer">
      {/* Plot Background */}
      <div
        className={cn(
          "w-full h-full rounded-xl border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-105",
          slot.type === 'building' && "bg-stone-100/90 border-stone-400 shadow-lg",
          slot.type === 'equipment' && "bg-yellow-100/90 border-yellow-400 shadow-lg",
          slot.type === 'animal' && "bg-green-100/90 border-green-400 shadow-lg",
          slot.type === 'crop' && "bg-lime-100/90 border-lime-400 shadow-lg"
        )}
        title={slot.name}
      >
        {/* Simple Icon */}
        <span className="text-3xl md:text-4xl transition-all duration-300 group-hover:scale-110">
          {slot.icon}
        </span>
      </div>

      {/* Rarity Effects */}
      {slot.rarity === 'rare' && (
        <div className="absolute inset-0 border-2 border-purple-400/60 rounded-xl animate-pulse" />
      )}
      {slot.rarity === 'uncommon' && (
        <div className="absolute inset-0 border-2 border-blue-400/60 rounded-xl animate-pulse" />
      )}
    </div>
  );
};

export default IsometricFarmSlot;