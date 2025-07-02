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
    if (isEmpty || !slot) return;
    console.log('Dragging item:', slot.name, 'from position:', rowIndex, colIndex);
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
        console.log('Dropping item:', dragData.slot.name, 'at position:', rowIndex, colIndex);
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

  // Don't render anything for span cells (cells occupied by multi-cell items but not the main cell)
  if (slot?.isSpan) {
    return (
      <div 
        className="relative aspect-square"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* This is part of a larger item, don't render anything here */}
      </div>
    );
  }

  return (
    <div 
      className="relative flex items-center justify-center group cursor-move"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        gridColumn: `span ${slot.width || 1}`,
        gridRow: `span ${slot.height || 1}`,
        aspectRatio: (slot.width || 1) / (slot.height || 1),
      }}
    >
      {/* Clean Icon without blur effects */}
      <div
        className={cn(
          "transition-all duration-300 group-hover:scale-110 group-active:scale-95",
          "rounded-lg p-2",
          "hover:bg-white/10 active:bg-white/20",
          "flex items-center justify-center w-full h-full"
        )}
        title={slot.name}
      >
        <span 
          className={cn(
            "transition-all duration-300",
            slot.width > 1 || slot.height > 1 ? "text-6xl md:text-8xl" : "text-4xl md:text-5xl"
          )}
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