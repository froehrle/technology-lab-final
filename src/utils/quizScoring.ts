
export const calculateXP = (attemptCount: number, correct: boolean): number => {
  if (!correct) return 0;
  
  // Only award XP for the first correct attempt
  if (attemptCount === 1) {
    return 20; // First attempt gets full XP
  }
  
  return 0; // No additional XP for subsequent attempts
};

export const calculateNewFocusPoints = (currentFocusPoints: number, correct: boolean): number => {
  if (correct) {
    return Math.min(100, currentFocusPoints + 10);
  } else {
    return Math.max(0, currentFocusPoints - 20);
  }
};

export const shouldAllowProceed = (correct: boolean, attemptCount: number): boolean => {
  return correct || attemptCount >= 3;
};
