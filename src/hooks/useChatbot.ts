import { useMessageManagement } from './chatbot/useMessageManagement';
import { useChatAPI } from './chatbot/useChatAPI';
import { useQuestionGeneration } from './chatbot/useQuestionGeneration';
import { useChatInput } from './chatbot/useChatInput';

export const useChatbot = (courseId: string, onQuestionsGenerated: () => void) => {
  const {
    messages,
    setMessages,
    addMessage,
    setMessagesWithNew,
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

    console.log('Starting handleSendMessage with:', { inputValue, isProcessing });

    const userMessage = createMessage(inputValue, 'user');
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    clearInput();

    try {
      const response = await sendChatMessage(inputValue, messages, courseId);
      
      if (response.success) {
        const assistantMessage = createMessage(response.message, 'assistant', (Date.now() + 1).toString());
        const updatedMessages = setMessagesWithNew(newMessages, assistantMessage);
        console.log('Assistant message added to chat');

        // Add parameter extraction feedback message
        const extractionMessage = createMessage(
          '🔍 Analysiere deine Anfrage und generiere entsprechende Fragen...',
          'assistant',
          (Date.now() + 2).toString()
        );
        const messagesWithExtraction = setMessagesWithNew(updatedMessages, extractionMessage);

        // Automatically trigger question generation after chat response
        console.log('🤖 Auto-triggering question generation...');
        await generateQuestions(messagesWithExtraction, courseId, addMessage);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = createErrorMessage(error);
      addMessage(errorMessage);
    }

    console.log('handleSendMessage completed');
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