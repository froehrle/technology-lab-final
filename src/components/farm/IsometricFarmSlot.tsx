import React from 'react';

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
  // Only show owned items - empty slots and non-owned items are invisible
  if (isEmpty || !slot || !slot.isOwned) {
    return <div className="w-full h-full" />;
  }

  return (
    <div 
      className="w-full h-full flex items-center justify-center group transition-all duration-300 hover:scale-110"
      title={slot.name}
      style={{
        width: '100px',
        height: '100px'
      }}
    >
      {/* Simple icon display - 60px font size */}
      <span 
        className="transition-all duration-300 drop-shadow-lg select-none"
        style={{
          fontSize: '60px',
          lineHeight: '1'
        }}
      >
        {slot.icon}
      </span>
    </div>
  );
};

export default IsometricFarmSlot;