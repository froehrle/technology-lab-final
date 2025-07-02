import React from 'react';
import shopIcon from './DuolingoShopIcon.svg';

interface DuolingoShopIconProps {
  className?: string;
  size?: number;
}

const DuolingoShopIcon = ({ className = "", size = 24 }: DuolingoShopIconProps) => {
  return (
    <img 
      src={shopIcon} 
      alt="Shop" 
      className={`transition-all duration-200 hover:scale-110 ${className}`}
      width={size}
      height={size}
    />
  );
};

export default DuolingoShopIcon;