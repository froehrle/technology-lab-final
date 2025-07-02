import React from 'react';
import { cn } from '@/lib/utils';

interface IsometricFarmSlotProps {
  slot: any;
  rowIndex: number;
  colIndex: number;
  isEmpty: boolean;
  onDrop?: (slot: any, targetRow: number, targetCol: number) => void;
}

const IsometricFarmSlot: React.FC<IsometricFarmSlotProps> = ({ 
  slot, 
  rowIndex, 
  colIndex, 
  isEmpty,
  onDrop
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (isEmpty) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({
      slot,
      sourceRow: rowIndex,
      sourceCol: colIndex
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (onDrop && dragData.slot) {
        onDrop(dragData.slot, rowIndex, colIndex);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  };

  if (isEmpty) {
    return (
      <div 
        className="relative aspect-square flex items-center justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Invisible drop zone */}
      </div>
    );
  }

  return (
    <div 
      className="relative aspect-square flex items-center justify-center group cursor-move"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Blended Icon */}
      <div
        className={cn(
          "transition-all duration-300 group-hover:scale-110 group-active:scale-95",
          "backdrop-blur-sm rounded-lg p-2",
          "hover:bg-white/10 active:bg-white/20"
        )}
        title={slot.name}
      >
        <span 
          className="text-4xl md:text-5xl transition-all duration-300 drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(255,255,255,0.4))',
          }}
        >
          {slot.icon}
        </span>
      </div>

      {/* Subtle Rarity Effects */}
      {slot.rarity === 'rare' && (
        <div className="absolute inset-0 bg-purple-400/20 rounded-lg blur-sm animate-pulse pointer-events-none" />
      )}
      {slot.rarity === 'uncommon' && (
        <div className="absolute inset-0 bg-blue-400/20 rounded-lg blur-sm animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default IsometricFarmSlot;