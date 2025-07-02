import React from 'react';
import learnIcon from './DuolingoLearnIcon.svg';

interface DuolingoLearnIconProps {
  className?: string;
  size?: number;
}

const DuolingoLearnIcon = ({ className = "", size = 24 }: DuolingoLearnIconProps) => {
  return (
    <img 
      src={learnIcon} 
      alt="Learn" 
      className={`transition-all duration-200 hover:scale-110 ${className}`}
      width={size}
      height={size}
    />
  );
};

export default DuolingoLearnIcon;