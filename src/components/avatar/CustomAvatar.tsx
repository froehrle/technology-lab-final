import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CustomAvatarProps {
  src?: string | null;
  fallback: string;
  className?: string;
}

const CustomAvatar = ({ src, fallback, className }: CustomAvatarProps) => {
  return (
    <Avatar className={cn("relative overflow-hidden bg-muted", className)}>
      <AvatarImage src={src || undefined} />
      <AvatarFallback className="font-medium">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;