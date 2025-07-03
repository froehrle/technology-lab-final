import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export const ChatInput = ({ 
  value, 
  onChange, 
  onSend, 
  onKeyPress, 
  disabled 
}: ChatInputProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Beschreiben Sie, welche Fragen Sie benötigen..."
          disabled={disabled}
          className="flex-1"
        />
        <Button onClick={onSend} disabled={!value.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};