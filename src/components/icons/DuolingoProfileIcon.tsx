import React from 'react';
import profileIcon from './DuolingoProfileIcon.svg';

interface DuolingoProfileIconProps {
  className?: string;
  size?: number;
}

const DuolingoProfileIcon = ({ className = "", size = 24 }: DuolingoProfileIconProps) => {
  return (
    <img 
      src={profileIcon} 
      alt="Profile" 
      className={`transition-all duration-200 hover:scale-110 ${className}`}
      width={size}
      height={size}
    />
  );
};

export default DuolingoProfileIcon;