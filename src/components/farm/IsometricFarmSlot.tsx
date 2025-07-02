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
        minHeight: '100%',
        minWidth: '100%',
        backgroundColor: 'rgba(255, 0, 0, 0.1)' // Temporary debugging
      }}
    >
      {/* Item Icon - fills entire grid cell */}
      <div
        className="transition-all duration-300 group-hover:scale-110 flex items-center justify-center w-full h-full"
        title={slot.name}
        style={{
          backgroundColor: 'rgba(0, 255, 0, 0.1)' // Temporary debugging
        }}
      >
        <span 
          className="transition-all duration-300 drop-shadow-lg block"
          style={{
            fontSize: `${Math.max(slot.width || 1, slot.height || 1) * 2}rem`,
            lineHeight: '1',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${Math.max(slot.width || 1, slot.height || 1) * 0.8})`,
            backgroundColor: 'rgba(0, 0, 255, 0.1)' // Temporary debugging
          }}
        >
          {slot.icon}
        </span>
      </div>
    </div>
  );
};

export default IsometricFarmSlot;