import React from 'react';
import { Bot, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/button';
import { useChatbot } from '@/hooks/useChatbot';
import { ChatbotQuestionDialogProps } from './types';

const ChatbotQuestionDialog = ({
  open,
  onOpenChange,
  courseId,
  onQuestionsGenerated,
}: ChatbotQuestionDialogProps) => {
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isGenerating,
    isProcessing,
    questionsGenerated,
    handleSendMessage,
    handleKeyPress,
    handleGenerateQuestions,
  } = useChatbot(courseId, onQuestionsGenerated);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            KI-Assistent für Fragenerstellung
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ChatMessageList messages={messages} isLoading={isLoading} />
          
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
          />

          {isGenerating && (
            <div className="flex items-center justify-center pt-4 border-t mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fragen werden automatisch generiert...
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotQuestionDialog;