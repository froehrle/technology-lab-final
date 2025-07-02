import { useState } from 'react';

export const useQuizTimer = () => {
  const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);

  const clearAutoProgressTimer = () => {
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      setAutoProgressTimer(null);
    }
  };

  const setAutoProgressWithDelay = (callback: () => void, delay: number = 3000) => {
    clearAutoProgressTimer();
    const timer = setTimeout(callback, delay);
    setAutoProgressTimer(timer);
  };

  return {
    clearAutoProgressTimer,
    setAutoProgressWithDelay
  };
};