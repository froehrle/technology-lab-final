
import { useQueryClient } from '@tanstack/react-query';

export const useAchievements = () => {
  const queryClient = useQueryClient();

  const checkForNewAchievements = async (xpEarned: number) => {
    if (xpEarned <= 0) return;

    // Invalidate achievements queries to refetch them
    queryClient.invalidateQueries({ queryKey: ['student-achievements'] });
    queryClient.invalidateQueries({ queryKey: ['student-xp'] });
  };

  return {
    checkForNewAchievements
  };
};
