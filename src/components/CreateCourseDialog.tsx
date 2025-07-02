
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: () => void;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({
  open,
  onOpenChange,
  onCourseCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          description: formData.description,
          teacher_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Kurs erstellt",
        description: "Ihr neuer Kurs wurde erfolgreich erstellt.",
      });

      setFormData({ title: '', description: '' });
      onCourseCreated();
    } catch (error) {
      console.error('Fehler beim Erstellen des Kurses:', error);
      toast({
        title: "Fehler",
        description: "Der Kurs konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuen Kurs erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Kurs für Ihre Schüler.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Kurstitel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="z.B. Deutsch für Anfänger"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Kursbeschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschreiben Sie Ihren Kurs..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Erstelle...' : 'Kurs erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
