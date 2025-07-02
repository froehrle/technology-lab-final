import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAvatarItems } from '@/hooks/useAvatarItems';
import { cn } from '@/lib/utils';

interface CustomAvatarProps {
  src?: string | null;
  fallback: string;
  className?: string;
}

const CustomAvatar = ({ src, fallback, className }: CustomAvatarProps) => {
  const { equippedItems, loading } = useAvatarItems();

  // Don't apply custom styles while loading to prevent flashing
  if (loading) {
    return (
      <Avatar className={className}>
        <AvatarImage src={src || undefined} />
        <AvatarFallback className="font-medium">
          {fallback}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Debug logging
  console.log('Equipped items:', equippedItems);

  const avatarClasses = cn(
    "relative overflow-hidden",
    equippedItems.background || "bg-muted",
    className
  );

  const containerClasses = cn(
    "relative",
    equippedItems.border, // ring classes need container padding
    equippedItems.effect,
    // Add padding for rings to be visible
    (equippedItems.border && equippedItems.border.includes('ring')) ? "p-1" : ""
  );

  return (
    <div className={containerClasses}>
      <Avatar className={avatarClasses}>
        <AvatarImage src={src || undefined} />
        <AvatarFallback className="font-medium">
          {fallback}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default CustomAvatar;