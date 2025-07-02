import React from 'react';

interface FarmSlotProps {
  slot: any;
  isEmpty: boolean;
}

const FarmSlot: React.FC<FarmSlotProps> = ({ slot, isEmpty }) => {
  // Show empty slot if no item or item is not owned
  if (isEmpty || !slot || !slot.isOwned) {
    return (
      <div className="w-full h-full border border-white/20 bg-white/5 rounded-lg flex items-center justify-center">
        <div className="w-2 h-2 bg-white/30 rounded-full"></div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full bg-white/10 border border-white/30 rounded-lg flex items-center justify-center group transition-all duration-300 hover:bg-white/20 hover:scale-105 cursor-pointer"
      title={slot.name}
    >
      <span 
        className="text-6xl md:text-7xl lg:text-8xl transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        {slot.icon}
      </span>
    </div>
  );
};

export default FarmSlot;