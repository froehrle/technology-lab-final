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
        className="relative aspect-square flex items-center justify-center"
        style={{
          transform: `translateZ(${rowIndex * 2}px)`,
        }}
      >
        <div className="w-16 h-16 bg-amber-100/80 border-2 border-dashed border-amber-400/60 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
          <span className="text-amber-600 text-xl font-bold">+</span>
        </div>
      </div>
    );
  }

  // Calculate isometric positioning
  const depth = rowIndex * 6;
  const elevation = slot.type === 'building' ? 30 : slot.type === 'equipment' ? 20 : 15;
  
  // Custom 3D Icon Components
  const CustomIcon = ({ type, icon }: { type: string; icon: string }) => {
    const getIconStyle = () => {
      switch (type) {
        case 'building':
          return {
            container: "w-20 h-20 bg-gradient-to-br from-stone-200 to-stone-400 border-4 border-stone-600 rounded-2xl shadow-2xl",
            icon: "text-4xl",
            glow: "shadow-stone-500/50"
          };
        case 'animal':
          return {
            container: "w-18 h-18 bg-gradient-to-br from-green-200 to-green-400 border-4 border-green-700 rounded-full shadow-2xl",
            icon: "text-3xl",
            glow: "shadow-green-500/50"
          };
        case 'equipment':
          return {
            container: "w-18 h-18 bg-gradient-to-br from-yellow-200 to-yellow-500 border-4 border-yellow-700 rounded-2xl shadow-2xl",
            icon: "text-3xl",
            glow: "shadow-yellow-500/50"
          };
        case 'crop':
          return {
            container: "w-16 h-16 bg-gradient-to-br from-lime-200 to-lime-400 border-4 border-lime-700 rounded-xl shadow-2xl",
            icon: "text-3xl",
            glow: "shadow-lime-500/50"
          };
        default:
          return {
            container: "w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-400 border-4 border-gray-600 rounded-xl shadow-2xl",
            icon: "text-3xl",
            glow: "shadow-gray-500/50"
          };
      }
    };

    const style = getIconStyle();
    
    return (
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1",
          style.container,
          style.glow
        )}
        style={{
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.8),
            inset 0 -2px 4px rgba(0,0,0,0.2),
            0 8px 16px rgba(0,0,0,0.3),
            0 0 20px rgba(255,255,255,0.2)
          `,
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-1 bg-gradient-to-br from-white/40 to-transparent rounded-xl" />
        
        {/* Icon */}
        <span 
          className={cn("relative z-10 transition-all duration-300", style.icon)}
          style={{
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
            textShadow: '0 0 8px rgba(255,255,255,0.8)',
          }}
        >
          {icon}
        </span>

        {/* Shine effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl opacity-60"
          style={{ transform: 'rotate(-45deg) scale(1.2)' }}
        />
      </div>
    );
  };

  return (
    <div
      className="relative aspect-square flex items-center justify-center group cursor-pointer"
      style={{
        transform: `
          translateZ(${depth + elevation}px)
          scale(${1 + rowIndex * 0.08})
        `,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Enhanced Shadow */}
      <div
        className="absolute bg-black/40 rounded-full blur-md"
        style={{
          width: '90%',
          height: '25%',
          bottom: '-15px',
          transform: `translateZ(-${elevation}px) rotateX(90deg)`,
        }}
      />
      
      {/* Plot Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-100/80 to-amber-200/80 rounded-2xl border-2 border-amber-300/60 backdrop-blur-sm"
        style={{
          transform: 'translateZ(-5px)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}
      />

      {/* Custom 3D Icon */}
      <div className="relative z-10">
        <CustomIcon type={slot.type} icon={slot.icon} />
      </div>

      {/* Enhanced Rarity Effects */}
      {slot.rarity === 'rare' && (
        <>
          <div className="absolute inset-0 bg-purple-400/30 rounded-2xl blur-xl animate-pulse" />
          <div className="absolute inset-0 border-2 border-purple-400/60 rounded-2xl animate-pulse" />
        </>
      )}
      {slot.rarity === 'uncommon' && (
        <>
          <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-xl animate-pulse" />
          <div className="absolute inset-0 border-2 border-blue-400/60 rounded-2xl animate-pulse" />
        </>
      )}

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
    </div>
  );
};

export default IsometricFarmSlot;