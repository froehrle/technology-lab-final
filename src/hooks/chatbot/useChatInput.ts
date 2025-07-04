import { useState } from 'react';

export const useChatInput = () => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent, onSubmit: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const clearInput = () => {
    setInputValue('');
  };

  return {
    inputValue,
    setInputValue,
    handleKeyPress,
    clearInput,
  };
};