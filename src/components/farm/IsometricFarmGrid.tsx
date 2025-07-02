import React, { useState } from 'react';
import { useFarmItems } from '@/hooks/useFarmItems';
import IsometricFarmSlot from './IsometricFarmSlot';
import { Button } from '@/components/ui/button';
import farmBackground from '@/assets/farmville-background.jpg';

const IsometricFarmGrid = () => {
  const { getGridLayout, loading, getNextPurchasableItem } = useFarmItems();
  const [showGrid, setShowGrid] = useState(false);

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
      {/* Grid Toggle Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          onClick={() => setShowGrid(!showGrid)}
          variant={showGrid ? "default" : "outline"}
          size="sm"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
        >
          {showGrid ? "🔲 Grid Ein" : "⬜ Grid Aus"}
        </Button>
      </div>

      {/* Farm Field Background - Using the actual uploaded image */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-green-500/60"
        style={{
          aspectRatio: '5/3',
          backgroundImage: 'url(/lovable-uploads/c8b636c7-2619-4138-8984-c6f44b8e5bef.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Grid Overlay - Only visible when toggled */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: 'calc(100% / 20) calc(100% / 12)'
          }} />
        )}
        
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
        
        {/* Farm Grid - Starts exactly at corners */}
        <div className="absolute inset-0" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(10, 1fr)', 
          gridTemplateRows: 'repeat(6, 1fr)', 
          gap: '0px'
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