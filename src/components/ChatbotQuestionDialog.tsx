import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onQuestionsGenerated: () => void;
}

const ChatbotQuestionDialog = ({
  open,
  onOpenChange,
  courseId,
  onQuestionsGenerated,
}: ChatbotQuestionDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hallo! Ich helfe Ihnen dabei, Fragen für Ihren Kurs zu erstellen. Beschreiben Sie mir einfach, welche Art von Fragen Sie benötigen - das Thema, den Schwierigkeitsgrad oder spezifische Lernziele.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          message: inputValue,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          courseId: courseId
        }
      });

      if (error) throw error;

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Auto-generate questions after first AI response
        if (messages.length === 1) { // Only initial greeting message exists
          setTimeout(() => {
            handleGenerateQuestions();
          }, 1000); // Small delay to let user see the response
        }
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Kommunikation mit dem Chatbot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateQuestions = async () => {
    if (messages.length <= 1) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions-from-chat', {
        body: {
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          courseId: courseId,
          teacherId: user?.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Fragen generiert",
          description: `${data.questionsGenerated} Fragen wurden zur Überprüfung erstellt.`,
        });
        onQuestionsGenerated();
        onOpenChange(false);
      } else {
        throw new Error(data.error || 'Fragenerstellung fehlgeschlagen');
      }
    } catch (error) {
      console.error('Question generation error:', error);
      toast({
        title: "Fehler",
        description: "Die Fragen konnten nicht generiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
          <ScrollArea className="flex-1 pr-4 max-h-[400px]">
            <div className="space-y-4 pb-4" ref={scrollAreaRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Tippt...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Beschreiben Sie, welche Fragen Sie benötigen..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center pt-4 border-t mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fragen werden erstellt...
              </div>
            </div>
          )}
          
          {!isGenerating && (
            <div className="flex justify-between items-center pt-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                {messages.length > 1 ? 'Fragen werden automatisch nach Ihrer Anfrage erstellt.' : 'Beschreiben Sie, welche Fragen Sie benötigen.'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Abbrechen
                </Button>
                {messages.length > 1 && (
                  <Button onClick={handleGenerateQuestions} disabled={isGenerating}>
                    Fragen manuell generieren
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotQuestionDialog;