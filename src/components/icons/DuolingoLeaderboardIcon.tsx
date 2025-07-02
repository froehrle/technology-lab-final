import React from 'react';
import leaderboardIcon from './DuolingoLeaderboardIcon.svg';

interface DuolingoLeaderboardIconProps {
  className?: string;
  size?: number;
}

const DuolingoLeaderboardIcon = ({ className = "", size = 24 }: DuolingoLeaderboardIconProps) => {
  return (
    <img 
      src={leaderboardIcon} 
      alt="Leaderboard" 
      className={`transition-all duration-200 hover:scale-110 ${className}`}
      width={size}
      height={size}
    />
  );
};

export default DuolingoLeaderboardIcon;