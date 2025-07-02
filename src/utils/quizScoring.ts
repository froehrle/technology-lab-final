
export const calculateXP = (attemptCount: number, correct: boolean): number => {
  if (!correct) return 0;
  
  switch (attemptCount) {
    case 1: return 20;
    case 2: return 10;
    default: return 0;
  }
};

export const calculateNewFocusPoints = (
  currentFocusPoints: number, 
  correct: boolean
): number => {
  if (correct) {
    return Math.min(100, currentFocusPoints + 5);
  } else {
    return Math.max(0, currentFocusPoints - 10);
  }
};

export const shouldAllowProceed = (
  correct: boolean, 
  attemptCount: number
): boolean => {
  if (correct) return true;
  return attemptCount >= 3;
};
