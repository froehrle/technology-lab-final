import { useMessageManagement } from './chatbot/useMessageManagement';
import { useChatAPI } from './chatbot/useChatAPI';
import { useQuestionGeneration } from './chatbot/useQuestionGeneration';
import { useChatInput } from './chatbot/useChatInput';

export const useChatbot = (courseId: string, onQuestionsGenerated: () => void) => {
  const {
    messages,
    setMessages,
    addMessage,
    createMessage,
    createErrorMessage,
  } = useMessageManagement();

  const { isLoading, sendChatMessage } = useChatAPI();
  
  const {
    isGenerating,
    questionsGenerated,
    lastParameters,
    generateQuestions,
  } = useQuestionGeneration(onQuestionsGenerated);

  const {
    inputValue,
    setInputValue,
    handleKeyPress: handleInputKeyPress,
    clearInput,
  } = useChatInput();

  // Combined processing state for better UX
  const isProcessing = isLoading || isGenerating;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    console.log('🚀 Starting handleSendMessage with:', { inputValue, isProcessing, currentMessageCount: messages.length });

    const userMessage = createMessage(inputValue, 'user');
    addMessage(userMessage);
    clearInput();

    try {
      const response = await sendChatMessage(inputValue, messages, courseId);
      
      if (response.success) {
        const assistantMessage = createMessage(response.message, 'assistant', (Date.now() + 1).toString());
        addMessage(assistantMessage);
        console.log('✅ Assistant message added to chat');

        // Add parameter extraction feedback message
        const extractionMessage = createMessage(
          '🔍 Analysiere deine Anfrage und generiere entsprechende Fragen...',
          'assistant',
          (Date.now() + 2).toString()
        );
        addMessage(extractionMessage);
        console.log('🔍 Extraction message added to chat');

        // Build complete message array manually since React state is async
        const completeMessages = [
          ...messages,
          userMessage,
          assistantMessage,
          extractionMessage
        ];
        
        console.log('🤖 Auto-triggering question generation with complete messages:', completeMessages.length);
        await generateQuestions(completeMessages, courseId, addMessage);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = createErrorMessage(error);
      addMessage(errorMessage);
    }

    console.log('✅ handleSendMessage completed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    handleInputKeyPress(e, handleSendMessage);
  };

  const handleGenerateQuestions = async (messagesOverride?: any[]) => {
    const messagesToUse = messagesOverride || messages;
    await generateQuestions(messagesToUse, courseId, addMessage);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isGenerating,
    isProcessing,
    questionsGenerated,
    lastParameters,
    handleSendMessage,
    handleKeyPress,
    handleGenerateQuestions,
  };
};