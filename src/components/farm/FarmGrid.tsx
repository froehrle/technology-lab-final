import React from 'react';
import { useFarmItems } from '@/hooks/useFarmItems';
import FarmGridSlot from './FarmGridSlot';

const FarmGrid = () => {
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
    <div className="w-full max-w-6xl mx-auto">
      {/* Farm Background */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-green-300">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
          }}
        />
        
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Farm Grid */}
        <div className="relative z-10 p-8" style={{ perspective: '1000px' }}>
          <div className="grid grid-cols-6 gap-4 h-96" style={{ transformStyle: 'preserve-3d' }}>
            {gridLayout.map((row, rowIndex) =>
              row.map((slot, colIndex) => 
                slot && slot.isOwned ? (
                  <FarmGridSlot
                    key={`${rowIndex}-${colIndex}`}
                    slot={slot}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                  />
                ) : null
              )
            )}
          </div>
        </div>
      </div>

      {/* Farm Stats */}
      <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {gridLayout.flat().filter(slot => slot?.isOwned).length}
              </div>
              <div className="text-xs text-foreground/70">Gegenstände</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-achievement">
                {Math.round((gridLayout.flat().filter(slot => slot?.isOwned).length / gridLayout.flat().filter(slot => slot !== null).length) * 100) || 0}%
              </div>
              <div className="text-xs text-foreground/70">Vollständig</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground/70">Deine Farm</div>
            <div className="text-lg font-bold bg-gradient-to-r from-primary to-achievement bg-clip-text text-transparent">
              Sonnenhof
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmGrid;