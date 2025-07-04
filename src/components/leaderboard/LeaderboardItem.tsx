import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import CustomAvatar from '@/components/avatar/CustomAvatar';
import { RankIcon } from './RankIcon';
import { LeaderboardEntry } from '@/hooks/useLeaderboardData';

interface LeaderboardItemProps {
  student: LeaderboardEntry;
  index: number;
}

const getRankBadgeVariant = (rank: number) => {
  switch (rank) {
    case 1:
      return "default";
    case 2:
      return "secondary";
    case 3:
      return "outline";
    default:
      return "outline";
  }
};

export const LeaderboardItem = ({ student, index }: LeaderboardItemProps) => {
  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border transition-all animate-fade-in ${
        student.isCurrentUser 
          ? 'bg-primary/5 border-primary shadow-md' 
          : 'hover:bg-muted/50'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <RankIcon rank={student.rank} />
          <Badge variant={getRankBadgeVariant(student.rank)}>
            #{student.rank}
          </Badge>
        </div>
        
        {student.isAnonymized ? (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        ) : (
          <CustomAvatar
            src={student.avatarUrl}
            fallback={student.displayName.charAt(0).toUpperCase()}
            className="h-10 w-10"
          />
        )}
        
        <div>
          <div className="flex items-center space-x-2">
            <p className={`font-medium ${student.isCurrentUser ? 'text-primary' : ''}`}>
              {student.displayName}
            </p>
            {student.isCurrentUser && (
              <Badge variant="outline" className="text-xs">
                Du
              </Badge>
            )}
          </div>
          {student.equippedTitle && (
            <p className="text-sm text-muted-foreground italic">
              {student.equippedTitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <p className={`text-lg font-bold ${
          student.rank === 1 ? 'text-yellow-600' :
          student.rank === 2 ? 'text-gray-600' :
          student.rank === 3 ? 'text-amber-600' :
          'text-muted-foreground'
        }`}>
          {student.totalXP} XP
        </p>
      </div>
    </div>
  );
};