import React from 'react';
import { useFarmItems } from '@/hooks/useFarmItems';
import IsometricFarmSlot from './IsometricFarmSlot';
import farmBackground from '@/assets/farmville-background.jpg';

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
      {/* Simple Farm Container */}
      <div 
        className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-green-400/80"
        style={{
          backgroundImage: `url(${farmBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Bright sunny overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-green-100/20"></div>
        
        {/* Simple Flat Grid */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-4 p-6">
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
      </div>
    </div>
  );
};

export default IsometricFarmGrid;