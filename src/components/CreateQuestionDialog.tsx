
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface CreateQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onQuestionCreated: () => void;
}

const CreateQuestionDialog: React.FC<CreateQuestionDialogProps> = ({
  open,
  onOpenChange,
  courseId,
  onQuestionCreated,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    correct_answer: '',
  });
  const [options, setOptions] = useState<string[]>(['', '', '', '']);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      correct_answer: '',
    });
    setOptions(['', '', '', '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredOptions = options.filter(option => option.trim() !== '');
      
      if (formData.question_type === 'multiple_choice' && filteredOptions.length < 2) {
        toast({
          title: "Fehler",
          description: "Multiple-Choice-Fragen benötigen mindestens 2 Antwortmöglichkeiten.",
          variant: "destructive",
        });
        return;
      }

      if (formData.question_type === 'multiple_choice' && !filteredOptions.includes(formData.correct_answer)) {
        toast({
          title: "Fehler",
          description: "Die richtige Antwort muss eine der Antwortmöglichkeiten sein.",
          variant: "destructive",
        });
        return;
      }

      const questionData = {
        course_id: courseId,
        question_text: formData.question_text,
        question_type: formData.question_type,
        points: formData.points,
        correct_answer: formData.correct_answer,
        options: formData.question_type === 'multiple_choice' ? filteredOptions : null,
      };

      const { error } = await supabase
        .from('questions')
        .insert(questionData);

      if (error) throw error;

      toast({
        title: "Frage erstellt",
        description: "Die Frage wurde erfolgreich hinzugefügt.",
      });

      resetForm();
      onQuestionCreated();
    } catch (error) {
      console.error('Fehler beim Erstellen der Frage:', error);
      toast({
        title: "Fehler",
        description: "Die Frage konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Frage erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine neue Frage für diesen Kurs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question_text">Fragetext</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="Geben Sie Ihre Frage ein..."
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question_type">Fragetyp</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value) => setFormData({ ...formData, question_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="text">Textantwort</SelectItem>
                  <SelectItem value="true_false">Wahr/Falsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Punkte</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          {formData.question_type === 'multiple_choice' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Antwortmöglichkeiten</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Option hinzufügen
                </Button>
              </div>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="correct_answer">Richtige Antwort</Label>
            {formData.question_type === 'multiple_choice' ? (
              <Select
                value={formData.correct_answer}
                onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie die richtige Antwort" />
                </SelectTrigger>
                <SelectContent>
                  {options.filter(option => option.trim() !== '').map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : formData.question_type === 'true_false' ? (
              <Select
                value={formData.correct_answer}
                onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie die richtige Antwort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Wahr</SelectItem>
                  <SelectItem value="false">Falsch</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Textarea
                id="correct_answer"
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                placeholder="Geben Sie die richtige Antwort ein..."
                required
                rows={2}
              />
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Erstelle...' : 'Frage erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionDialog;
