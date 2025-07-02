import React from 'react';
import { useFarmItems } from '@/hooks/useFarmItems';
import IsometricFarmSlot from './IsometricFarmSlot';
import farmBackground from '@/assets/farm-background.jpg';

const IsometricFarmGrid = () => {
  const { getGridLayout, loading } = useFarmItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Lade Farm...</p>
        </div>
      </div>
    );
  }

  const gridLayout = getGridLayout();

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Isometric Farm Container */}
      <div 
        className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-green-300/50"
        style={{
          backgroundImage: `url(${farmBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'perspective(1000px) rotateX(45deg) scale(1.1)',
          transformOrigin: 'center bottom',
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Isometric Grid */}
        <div 
          className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-2 p-4"
          style={{
            transform: 'rotateX(-45deg) rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {gridLayout.map((row, rowIndex) =>
            row.map((slot, colIndex) => (
              <IsometricFarmSlot
                key={`${rowIndex}-${colIndex}`}
                slot={slot}
                rowIndex={rowIndex}
                colIndex={colIndex}
                isEmpty={!slot || !slot.isOwned}
              />
            ))
          )}
        </div>

        {/* Depth lines for isometric effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={`vertical-${i}`}
              className="absolute border-l border-white/10"
              style={{
                left: `${(i + 1) * 16.67}%`,
                top: '0',
                height: '100%',
                transform: 'skewY(-30deg)',
              }}
            />
          ))}
          {[...Array(3)].map((_, i) => (
            <div
              key={`horizontal-${i}`}
              className="absolute border-t border-white/10"
              style={{
                top: `${(i + 1) * 25}%`,
                left: '0',
                width: '100%',
                transform: 'skewX(-30deg)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IsometricFarmGrid;