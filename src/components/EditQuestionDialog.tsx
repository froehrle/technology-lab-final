import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string | null;
  created_at: string;
  updated_at: string;
}

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
  onQuestionUpdated: () => void;
}

const EditQuestionDialog = ({ open, onOpenChange, question, onQuestionUpdated }: EditQuestionDialogProps) => {
  const { toast } = useToast();
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [options, setOptions] = useState<string[]>(['']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setQuestionType(question.question_type);
      setCorrectAnswer(question.correct_answer || '');
      
      if (question.options) {
        if (Array.isArray(question.options)) {
          setOptions(question.options);
        } else if (typeof question.options === 'object') {
          setOptions(Object.values(question.options));
        }
      } else {
        setOptions(['']);
      }
    }
  }, [question]);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      if (correctAnswer === options[index]) {
        setCorrectAnswer('');
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Frage ein.",
        variant: "destructive",
      });
      return;
    }

    if (questionType === 'multiple_choice' && (!options.some(opt => opt.trim()) || !correctAnswer)) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Antwortoptionen und die richtige Antwort an.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {
        question_text: questionText,
        question_type: questionType,
        correct_answer: correctAnswer || null,
      };

      if (questionType === 'multiple_choice') {
        updateData.options = options.filter(opt => opt.trim());
      } else {
        updateData.options = null;
      }

      const { error } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Frage aktualisiert",
        description: "Die Frage wurde erfolgreich aktualisiert.",
      });

      onQuestionUpdated();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Frage:', error);
      toast({
        title: "Fehler",
        description: "Die Frage konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Frage bearbeiten</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question-text">Frage</Label>
            <Textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Geben Sie Ihre Frage ein..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="question-type">Fragetyp</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="text">Textantwort</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {questionType === 'multiple_choice' && (
            <div>
              <Label>Antwortoptionen</Label>
              <div className="space-y-2 mt-1">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Option hinzufügen
                </Button>
              </div>
            </div>
          )}

          {questionType === 'multiple_choice' && (
            <div>
              <Label htmlFor="correct-answer">Richtige Antwort</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Wählen Sie die richtige Antwort" />
                </SelectTrigger>
                <SelectContent>
                  {options.filter(opt => opt.trim()).map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {questionType === 'text' && (
            <div>
              <Label htmlFor="text-answer">Musterantwort (optional)</Label>
              <Input
                id="text-answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Geben Sie eine Musterantwort ein..."
                className="mt-1"
              />
            </div>
          )}


          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : 'Frage aktualisieren'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionDialog;
