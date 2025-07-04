
interface Question {
  correct_answer: string;
}

interface ToastFunction {
  (params: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
  }): void;
}

export const showAnswerFeedback = (
  correct: boolean,
  attemptCount: number,
  xpEarned: number,
  currentQuestion: Question,
  toast: ToastFunction,
  feedbackText?: string
) => {
  if (correct) {
    if (xpEarned > 0) {
      toast({
        title: `+${xpEarned} XP!`,
        description: attemptCount === 1 ? 'Perfekt beim ersten Versuch!' : 'Richtig!',
      });
    }
    // Don't show toast for correct answers without XP - feedback is already visible in the card
  } else {
    // Only show toast for final attempt (when user can't retry)
    if (attemptCount >= 3) {
      toast({
        title: "Maximale Versuche erreicht",
        description: "Weiter zur nächsten Frage!",
        variant: "destructive"
      });
    }
    // For attempts 1-2, feedback is shown in the card only
  }
};

export const showQuizCompletionToast = (toast: ToastFunction) => {
  // Delay to ensure any pending answer feedback is shown first
  setTimeout(() => {
    toast({
      title: "🎉 Quiz abgeschlossen!",
      description: "Glückwunsch! Sie haben das Quiz abgeschlossen und 500 Bonus-Coins erhalten!",
    });
  }, 500);
};
