import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatActionsProps {
  isGenerating: boolean;
  messageCount: number;
  questionsGenerated: boolean;
  onCancel: () => void;
  onGenerateQuestions: () => void;
}

export const ChatActions = ({ 
  isGenerating, 
  messageCount, 
  questionsGenerated,
  onCancel, 
  onGenerateQuestions 
}: ChatActionsProps) => {
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center pt-4 border-t mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fragen werden erstellt...
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center pt-4 border-t mt-4">
      <div className="text-sm text-muted-foreground">
        {questionsGenerated 
          ? 'Fragen wurden generiert! Sie können weitere Fragen stellen oder neue Fragen generieren.'
          : messageCount > 1 
            ? 'Bereit zum Generieren von Fragen basierend auf dem Gespräch.'
            : 'Beschreiben Sie, welche Fragen Sie benötigen.'
        }
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Schließen
        </Button>
        {messageCount > 1 && (
          <Button onClick={onGenerateQuestions} disabled={isGenerating}>
            {questionsGenerated ? 'Weitere Fragen generieren' : 'Fragen generieren'}
          </Button>
        )}
      </div>
    </div>
  );
};