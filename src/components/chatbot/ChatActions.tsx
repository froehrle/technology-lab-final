import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatActionsProps {
  isGenerating: boolean;
  messageCount: number;
  onCancel: () => void;
  onGenerateQuestions: () => void;
}

export const ChatActions = ({ 
  isGenerating, 
  messageCount, 
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
        {messageCount > 1 
          ? 'Fragen werden automatisch nach Ihrer Anfrage erstellt.' 
          : 'Beschreiben Sie, welche Fragen Sie benötigen.'
        }
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        {messageCount > 1 && (
          <Button onClick={onGenerateQuestions} disabled={isGenerating}>
            Fragen manuell generieren
          </Button>
        )}
      </div>
    </div>
  );
};