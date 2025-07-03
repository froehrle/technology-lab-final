import React from 'react';
import { Bot } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ChatActions } from './ChatActions';
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
    handleSendMessage,
    handleKeyPress,
    handleGenerateQuestions,
  } = useChatbot(courseId, () => {
    onQuestionsGenerated();
    onOpenChange(false);
  });

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
            disabled={isLoading}
          />

          <ChatActions
            isGenerating={isGenerating}
            messageCount={messages.length}
            onCancel={() => onOpenChange(false)}
            onGenerateQuestions={handleGenerateQuestions}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotQuestionDialog;