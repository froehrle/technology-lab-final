import React from 'react';
import { useFarmItems } from '@/hooks/useFarmItems';
import Farm3DGrid from './Farm3DGrid';

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
      {/* 3D Farm Visualization */}
      <Farm3DGrid />

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