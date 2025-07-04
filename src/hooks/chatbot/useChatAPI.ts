import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/chatbot/types';

export const useChatAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendChatMessage = async (
    message: string,
    conversationHistory: Message[],
    courseId: string
  ) => {
    setIsLoading(true);
    
    try {
      console.log('Calling chatbot-conversation function...');
      const { data, error } = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          message,
          conversationHistory: conversationHistory.map(m => ({ role: m.role, content: m.content })),
          courseId
        }
      });

      console.log('Chatbot response:', { data, error });

      if (error) throw error;

      if (data?.success) {
        return {
          success: true,
          message: data.message
        };
      } else {
        throw new Error(data?.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Kommunikation mit dem Chatbot.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendChatMessage,
  };
};