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
  if (!slot || !slot.isOwned) {
    return null;
  }

  return (
    <div
      className="relative aspect-square flex items-center justify-center transition-all duration-300 group"
      style={{
        transform: `translateY(${rowIndex * 2}px)`, // Depth effect
      }}
    >
      {/* Item Icon - integrated into background */}
      <div
        className="text-4xl transition-all duration-300 group-hover:scale-110 drop-shadow-lg filter"
        title={slot.name}
        style={{
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        {slot.icon}
      </div>
    </div>
  );
};

export default FarmGridSlot;