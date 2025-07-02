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
  // Only show owned items - empty slots and non-owned items are invisible
  if (isEmpty || !slot || !slot.isOwned) {
    return <div className="relative" />;
  }

  // Don't render anything for span cells (cells occupied by multi-cell items but not the main cell)
  if (slot?.isSpan) {
    return <div className="relative" />;
  }

  return (
    <div 
      className="relative flex items-center justify-center group transition-all duration-500"
      style={{
        gridColumn: `span ${slot.width || 1}`,
        gridRow: `span ${slot.height || 1}`,
        aspectRatio: (slot.width || 1) / (slot.height || 1),
      }}
    >
      {/* Item Icon - seamlessly integrated into background */}
      <div
        className="transition-all duration-300 group-hover:scale-110 flex items-center justify-center w-full h-full"
        title={slot.name}
      >
        <span 
          className={cn(
            "transition-all duration-300 drop-shadow-lg",
            slot.width > 1 || slot.height > 1 ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"
          )}
        >
          {slot.icon}
        </span>
      </div>
    </div>
  );
};

export default IsometricFarmSlot;