import React from 'react';
import { useFarmItems } from '@/hooks/useFarmItems';
import IsometricFarmSlot from './IsometricFarmSlot';
import farmBackground from '@/assets/farmville-background.jpg';

const IsometricFarmGrid = () => {
  const { getGridLayout, loading, getNextPurchasableItem } = useFarmItems();

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
  const nextItem = getNextPurchasableItem();

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Farm Puzzle Container with farmish green background */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-green-500/80 bg-gradient-to-br from-green-400 via-green-500 to-green-600"
        style={{
          aspectRatio: '5/3',
        }}
      >
        {/* Farm field pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-300/40 via-transparent to-green-700/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)`
        }}></div>
        
        {/* Next Item Indicator */}
        {nextItem && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="text-xs font-medium text-foreground/70">Als Nächstes:</div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{nextItem.icon}</span>
              <span className="text-sm font-semibold">{nextItem.name}</span>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">#{nextItem.purchase_order}</span>
            </div>
          </div>
        )}
        
        {/* Farm Grid - 5x3 layout with proper spacing */}
        <div className="absolute inset-0 p-8" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gridTemplateRows: 'repeat(3, 1fr)', 
          gap: '12px' 
        }}>
          {gridLayout.map((row, rowIndex) =>
            row.map((slot, colIndex) => (
              <IsometricFarmSlot
                key={`${rowIndex}-${colIndex}`}
                slot={slot}
                rowIndex={rowIndex}
                colIndex={colIndex}
                isEmpty={!slot}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IsometricFarmGrid;