import { useState } from 'react';
import { Message } from '@/components/chatbot/types';

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: 'Hallo! Ich helfe Ihnen dabei, Fragen für Ihren Kurs zu erstellen. Beschreiben Sie mir einfach, welche Art von Fragen Sie benötigen - das Thema, den Schwierigkeitsgrad oder spezifische Lernziele.',
  timestamp: new Date(),
};

export const useMessageManagement = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);

  const addMessage = (message: Message) => {
    console.log('🔄 Adding message:', message.id, message.content.substring(0, 50) + '...');
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('📝 Messages after add:', newMessages.length, 'total messages');
      return newMessages;
    });
  };

  const addMessages = (newMessages: Message[]) => {
    console.log('🔄 Adding multiple messages:', newMessages.length);
    setMessages(prev => {
      const updatedMessages = [...prev, ...newMessages];
      console.log('📝 Messages after bulk add:', updatedMessages.length, 'total messages');
      return updatedMessages;
    });
  };

  const createMessage = (content: string, role: 'user' | 'assistant', id?: string): Message => ({
    id: id || Date.now().toString(),
    role,
    content,
    timestamp: new Date(),
  });

  const createErrorMessage = (error: any, id?: string): Message => ({
    id: id || (Date.now() + 2).toString(),
    role: 'assistant',
    content: `❌ Entschuldigung, es gab ein Problem: ${error.message || error}\n\nBitte versuchen Sie es erneut.`,
    timestamp: new Date(),
  });

  return {
    messages,
    setMessages,
    addMessage,
    addMessages,
    createMessage,
    createErrorMessage,
  };
};