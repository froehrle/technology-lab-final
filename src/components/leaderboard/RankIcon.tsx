import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface RankIconProps {
  rank: number;
}

export const RankIcon = ({ rank }: RankIconProps) => {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Trophy className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />;
    default:
      return <Award className="h-5 w-5 text-muted-foreground" />;
  }
};