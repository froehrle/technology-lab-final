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
      {/* Farm Field Background - Rolling Green Hills */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-green-500/60"
        style={{
          aspectRatio: '5/3',
          background: `
            linear-gradient(180deg, 
              #a8e6a3 0%, 
              #8fbc8f 25%, 
              #90ee90 50%, 
              #98fb98 75%, 
              #7cb342 100%
            )
          `
        }}
      >
        {/* Rolling Hills Effect */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 120% 50% at 20% 70%, rgba(139, 195, 74, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 80% 60%, rgba(76, 175, 80, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 150% 40% at 50% 80%, rgba(104, 159, 56, 0.4) 0%, transparent 60%)
          `
        }}></div>
        
        {/* Grass at the Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-700 to-transparent opacity-80"></div>
        <div className="absolute bottom-0 left-0 right-0 h-4" style={{
          background: `repeating-linear-gradient(90deg, 
            transparent 0px, 
            rgba(56, 142, 60, 0.6) 1px, 
            rgba(56, 142, 60, 0.6) 2px, 
            transparent 3px, 
            transparent 8px
          )`
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