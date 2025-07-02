import React from 'react';
import homeIcon from './DuolingoHomeIcon.svg';

interface DuolingoHomeIconProps {
  className?: string;
  size?: number;
}

const DuolingoHomeIcon = ({ className = "", size = 24 }: DuolingoHomeIconProps) => {
  return (
    <img 
      src={homeIcon} 
      alt="Home" 
      className={`transition-all duration-200 hover:scale-110 ${className}`}
      width={size}
      height={size}
    />
  );
};

export default DuolingoHomeIcon;