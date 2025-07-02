import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ProfileBadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  badge_type: 'title' | 'badge';
  is_purchasable: boolean;
}

interface ProfileBadgeProps {
  badge: ProfileBadgeData;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'rare': return 'bg-blue-500';
    case 'epic': return 'bg-purple-500';
    case 'legendary': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const ProfileBadge = ({ badge, size = 'sm', showIcon = true, className }: ProfileBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <Badge 
      className={cn(
        "text-white font-medium",
        getRarityColor(badge.rarity),
        sizeClasses[size],
        className
      )}
      title={badge.description}
    >
      {showIcon && (
        <span className="mr-1">{badge.icon}</span>
      )}
      {badge.name}
    </Badge>
  );
};

export default ProfileBadge;