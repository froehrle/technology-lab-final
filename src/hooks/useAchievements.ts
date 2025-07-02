
import { useQueryClient } from '@tanstack/react-query';

export const useAchievements = () => {
  const queryClient = useQueryClient();

  const checkForNewAchievements = async (xpEarned: number) => {
    if (xpEarned <= 0) return;

    console.log('Checking for new achievements, invalidating queries...');
    
    // Invalidate achievements queries to refetch them
    queryClient.invalidateQueries({ queryKey: ['student-achievements'] });
    queryClient.invalidateQueries({ queryKey: ['student-xp'] });
    
    // Wait a bit for the database trigger to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force refetch of the XP data
    await queryClient.refetchQueries({ queryKey: ['student-xp'] });
  };

  return {
    checkForNewAchievements
  };
};
