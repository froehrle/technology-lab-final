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
      <div 
        className="relative aspect-square flex items-center justify-center opacity-30 hover:opacity-50 transition-opacity"
        style={{
          transform: `translateZ(${rowIndex * 2}px)`,
        }}
      >
        <div className="w-8 h-8 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
          <span className="text-white/50 text-xs">+</span>
        </div>
      </div>
    );
  }

  // Calculate isometric positioning
  const depth = rowIndex * 4;
  const elevation = slot.type === 'building' ? 20 : slot.type === 'equipment' ? 10 : 5;
  
  return (
    <div
      className="relative aspect-square flex items-center justify-center group cursor-pointer"
      style={{
        transform: `
          translateZ(${depth + elevation}px)
          scale(${1 + rowIndex * 0.05})
        `,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Item Shadow */}
      <div
        className="absolute bg-black/30 rounded-full blur-sm"
        style={{
          width: '80%',
          height: '20%',
          bottom: '-10px',
          transform: `translateZ(-${elevation}px) rotateX(90deg)`,
        }}
      />
      
      {/* Item Container */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300",
          "group-hover:scale-110 group-hover:-translate-y-2",
          slot.type === 'building' && "bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30",
          slot.type === 'equipment' && "bg-yellow-400/20 backdrop-blur-sm rounded-lg p-1 border border-yellow-400/40",
          slot.type === 'animal' && "bg-green-400/20 backdrop-blur-sm rounded-full p-1 border border-green-400/40",
          slot.type === 'crop' && "bg-lime-400/20 backdrop-blur-sm rounded-lg p-1 border border-lime-400/40"
        )}
        title={slot.name}
        style={{
          transform: 'translateZ(0px)',
          boxShadow: `
            0 ${2 + elevation/5}px ${4 + elevation/3}px rgba(0,0,0,0.3),
            0 0 ${8 + elevation/2}px rgba(255,255,255,0.1)
          `,
        }}
      >
        {/* Main Item Icon */}
        <span 
          className="text-2xl md:text-3xl transition-all duration-300 group-hover:text-4xl"
          style={{
            filter: `
              drop-shadow(2px 2px 4px rgba(0,0,0,0.5))
              drop-shadow(0px 0px 8px rgba(255,255,255,0.3))
            `,
            textShadow: '0 0 10px rgba(255,255,255,0.5)',
          }}
        >
          {slot.icon}
        </span>
      </div>

      {/* Rarity Glow */}
      {slot.rarity === 'rare' && (
        <div 
          className="absolute inset-0 bg-purple-500/20 rounded-lg blur-lg animate-pulse"
          style={{ transform: 'translateZ(-1px)' }}
        />
      )}
      {slot.rarity === 'uncommon' && (
        <div 
          className="absolute inset-0 bg-blue-500/20 rounded-lg blur-lg animate-pulse"
          style={{ transform: 'translateZ(-1px)' }}
        />
      )}

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default IsometricFarmSlot;