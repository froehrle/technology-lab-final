
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
  toast: ToastFunction
) => {
  if (correct) {
    if (xpEarned > 0) {
      toast({
        title: `+${xpEarned} XP!`,
        description: `${attemptCount === 1 ? 'Perfekt beim ersten Versuch!' : 'Richtig beim zweiten Versuch!'}`,
      });
    } else if (attemptCount >= 3) {
      toast({
        title: "Richtig!",
        description: "Kein XP nach dem 3. Versuch, aber weiter so!",
      });
    }
  } else {
    if (attemptCount < 3) {
      toast({
        title: "Noch nicht richtig",
        description: `Versuch ${attemptCount} von 3. Versuchen Sie es erneut!`,
        variant: "default"
      });
    } else {
      toast({
        title: "Falsch",
        description: `Die richtige Antwort ist: ${currentQuestion.correct_answer}`,
        variant: "destructive"
      });
    }
  }
};

export const showQuizCompletionToast = (toast: ToastFunction) => {
  toast({
    title: "Quiz abgeschlossen!",
    description: `Glückwunsch! Sie haben das Quiz abgeschlossen.`,
  });
};
