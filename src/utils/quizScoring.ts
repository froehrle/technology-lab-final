
export const calculateXP = (attemptCount: number, correct: boolean): number => {
  if (!correct) return 0;
  
  // Award XP based on attempt number
  if (attemptCount === 1) {
    return 20; // First attempt gets full XP
  } else if (attemptCount === 2) {
    return 10; // Second attempt gets half XP
  } else if (attemptCount === 3) {
    return 5; // Third attempt gets quarter XP
  }
  
  return 0; // No XP for attempts beyond 3
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
