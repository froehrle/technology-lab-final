import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/chatbot/types';

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: 'Hallo! Ich helfe Ihnen dabei, Fragen für Ihren Kurs zu erstellen. Beschreiben Sie mir einfach, welche Art von Fragen Sie benötigen - das Thema, den Schwierigkeitsgrad oder spezifische Lernziele.',
  timestamp: new Date(),
};

export const useChatbot = (courseId: string, onQuestionsGenerated: () => void) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
        if (isFirstInteraction) {
          setIsFirstInteraction(false);
          console.log('Triggering auto-generation after first AI response');
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

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isGenerating,
    handleSendMessage,
    handleKeyPress,
    handleGenerateQuestions,
  };
};