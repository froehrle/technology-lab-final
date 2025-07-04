import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/chatbot/types';

export const useQuestionGeneration = (onQuestionsGenerated: () => void) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [lastParameters, setLastParameters] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateQuestions = async (
    messages: Message[],
    courseId: string,
    addMessage: (message: Message) => void
  ) => {
    console.log('🚀 Starting handleGenerateQuestions with:', {
      messagesLength: messages.length,
      isGenerating,
      courseId,
      userId: user?.id
    });
    
    // Always try to generate questions if we have conversation content
    if (messages.length <= 1) {
      console.log('❌ Not enough messages for generation:', messages.length);
      return;
    }
    
    setIsGenerating(true);
    console.log('🔄 Starting question generation...');
    
    try {
      console.log('📡 Calling generate-questions-from-chat function...');
      const { data, error } = await supabase.functions.invoke('generate-questions-from-chat', {
        body: {
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
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
        setLastParameters(data.extractedParams);
        
        // Add a detailed success message to the chat with parameter feedback
        const paramInfo = data.extractedParams ? 
          `\n\n📋 Parameter: ${data.extractedParams.anzahl_fragen} ${data.extractedParams.fragetyp} (${data.extractedParams.schwierigkeitsgrad})` : '';
        
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `✅ Erfolgreich ${data.questionsGenerated || 'mehrere'} Fragen zur Überprüfung erstellt!${paramInfo}\n\nDie Fragen sind nun zur Überprüfung verfügbar. Sie können weitere Fragen stellen oder zusätzliche Fragen generieren.`,
          timestamp: new Date(),
        };
        addMessage(successMessage);
        
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
      addMessage(errorMessage);
      
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
    isGenerating,
    questionsGenerated,
    lastParameters,
    generateQuestions,
  };
};