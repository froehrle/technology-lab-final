import { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const { toast } = useToast();

  // Track if questions have been generated in this session
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  
  // Combined processing state for better UX
  const isProcessing = isLoading || isGenerating;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    console.log('Starting handleSendMessage with:', { inputValue, isProcessing });

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
      console.log('Calling chatbot-conversation function...');
      const { data, error } = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          message: inputValue,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          courseId: courseId
        }
      });

      console.log('Chatbot response:', { data, error });

      if (error) throw error;

      if (data?.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        console.log('Assistant message added to chat');
      } else {
        throw new Error(data?.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '❌ Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Nachricht. Bitte versuchen Sie es erneut.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Kommunikation mit dem Chatbot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('handleSendMessage completed');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateQuestions = async (messagesOverride?: Message[]) => {
    const messagesToUse = messagesOverride || messages;
    console.log('🚀 Starting handleGenerateQuestions with:', {
      messagesOverride: !!messagesOverride,
      messagesToUseLength: messagesToUse.length,
      currentMessagesLength: messages.length,
      isProcessing,
      isGenerating
    });
    
    if (messagesToUse.length <= 1) {
      console.log('❌ Not enough messages for generation:', messagesToUse.length);
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: '❌ Nicht genügend Gesprächsinhalte für die Fragenerstellung. Bitte beschreiben Sie zunächst, welche Art von Fragen Sie benötigen.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    setIsGenerating(true);
    console.log('🔄 Starting question generation...');
    
    try {
      console.log('📡 Calling generate-questions-from-chat function...');
      const { data, error } = await supabase.functions.invoke('generate-questions-from-chat', {
        body: {
          conversationHistory: messagesToUse.map(m => ({ role: m.role, content: m.content })),
          courseId: courseId,
          teacherId: user?.id
        }
      });

      console.log('📨 Generation response received:', { 
        data, 
        error,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        success: data?.success,
        questionsGenerated: data?.questionsGenerated
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Question generation successful!', {
          questionsGenerated: data.questionsGenerated,
          extractedParams: data.extractedParams
        });
        
        setQuestionsGenerated(true);
        
        // Add a detailed success message to the chat
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `✅ Erfolgreich ${data.questionsGenerated || 'mehrere'} Fragen zur Überprüfung erstellt!\n\nDie Fragen wurden basierend auf unserem Gespräch generiert und sind nun zur Überprüfung verfügbar. Sie können weitere Fragen stellen oder zusätzliche Fragen generieren.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
        
        toast({
          title: "Fragen generiert",
          description: `${data.questionsGenerated || 'Mehrere'} Fragen wurden zur Überprüfung erstellt.`,
        });
        
        console.log('📊 Calling onQuestionsGenerated callback...');
        onQuestionsGenerated();
        console.log('✅ Question generation flow completed successfully');
      } else {
        console.error('❌ Generation failed with response:', data);
        throw new Error(data?.error || 'Fragenerstellung fehlgeschlagen');
      }
    } catch (error) {
      console.error('💥 Question generation error:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 4).toString(),
        role: 'assistant',
        content: `❌ Entschuldigung, bei der Fragenerstellung ist ein Fehler aufgetreten: ${error.message}\n\nBitte versuchen Sie es erneut oder beschreiben Sie Ihre Anforderungen anders.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Fehler bei Fragenerstellung",
        description: error.message || "Die Fragen konnten nicht generiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      console.log('🏁 Question generation process finished');
    }
  };

  return {
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
  };
};