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

  // Calculate 3D positioning based on grid position
  const rotateX = (rowIndex - 1.5) * 5; // Slight tilt based on row
  const rotateY = (colIndex - 2.5) * 3; // Slight tilt based on column
  const translateZ = rowIndex * 10; // Depth based on row

  return (
    <div
      className="relative aspect-square flex items-center justify-center transition-all duration-500 group cursor-pointer"
      style={{
        transform: `translateY(${rowIndex * 2}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Item Icon - integrated into background with enhanced 3D effects */}
      <div
        className="text-4xl transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-2"
        title={slot.name}
        style={{
          filter: `
            drop-shadow(${2 + rowIndex}px ${2 + rowIndex}px ${4 + rowIndex * 2}px rgba(0,0,0,0.4))
            drop-shadow(0px 0px 8px rgba(0,0,0,0.2))
            drop-shadow(0px ${4 + rowIndex * 2}px ${8 + rowIndex * 2}px rgba(0,0,0,0.3))
          `,
          transform: 'translateZ(20px)',
          textShadow: `
            0 0 10px rgba(255,255,255,0.5),
            0 0 20px rgba(255,255,255,0.3),
            0 0 30px rgba(255,255,255,0.1)
          `,
        }}
      >
        {slot.icon}
      </div>
      
      {/* Ground shadow effect */}
      <div
        className="absolute bottom-0 w-8 h-2 bg-black/20 rounded-full blur-sm transition-all duration-500 group-hover:scale-110"
        style={{
          transform: `translateY(${10 + rowIndex * 2}px) rotateX(90deg) translateZ(-${translateZ}px)`,
        }}
      />
    </div>
  );
};

export default FarmGridSlot;