import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateQuestions, QuestionGenerationParams, GeneratedQuestion } from '@/utils/questionGeneration';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  schwierigkeitsgrad: z.enum(['leicht', 'mittel', 'schwer']),
  anzahl_fragen: z.number().min(1).max(50),
  thema: z.string().min(1, 'Thema ist erforderlich'),
  fragetyp: z.enum(['Verständnisfragen', 'Rechenfragen']),
  zielgruppe: z.string().min(1, 'Zielgruppe ist erforderlich'),
  keywords: z.string().min(1, 'Keywords sind erforderlich'),
});

type FormData = z.infer<typeof formSchema>;

interface GenerateQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onQuestionsGenerated: () => void;
}

const GenerateQuestionsDialog = ({
  open,
  onOpenChange,
  courseId,
  onQuestionsGenerated,
}: GenerateQuestionsDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schwierigkeitsgrad: 'mittel',
      anzahl_fragen: 5,
      thema: '',
      fragetyp: 'Verständnisfragen',
      zielgruppe: '',
      keywords: '',
    },
  });

  const saveQuestionsToDatabase = async (questions: GeneratedQuestion[], questionStyle: string) => {
    const questionsToInsert = questions.map(q => ({
      course_id: courseId,
      question_text: q.question_text,
      question_type: q.question_type,
      question_style: questionStyle,
      options: q.options ? JSON.stringify(q.options) : null,
      correct_answer: q.correct_answer,
    }));

    const { error } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (error) throw error;
  };

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    try {
      // Generate questions via API
      const generatedQuestions = await generateQuestions(data as QuestionGenerationParams);
      
      if (generatedQuestions.length === 0) {
        toast({
          title: "Keine Fragen generiert",
          description: "Der Server hat keine Fragen zurückgegeben.",
          variant: "destructive",
        });
        return;
      }

      // Save to database
      await saveQuestionsToDatabase(generatedQuestions, data.fragetyp);

      toast({
        title: "Fragen erfolgreich generiert",
        description: `${generatedQuestions.length} Fragen wurden erstellt und gespeichert.`,
      });

      onQuestionsGenerated();
      onOpenChange(false);
      form.reset();

    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Fehler bei der Fragenerstellung",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fragen automatisch generieren</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="schwierigkeitsgrad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schwierigkeitsgrad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Schwierigkeitsgrad wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="leicht">Leicht</SelectItem>
                        <SelectItem value="mittel">Mittel</SelectItem>
                        <SelectItem value="schwer">Schwer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anzahl_fragen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl der Fragen</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="thema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thema</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Datenbanken, JavaScript, Mathematik"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fragetyp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fragetyp</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Fragetyp wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Verständnisfragen">Verständnisfragen</SelectItem>
                      <SelectItem value="Rechenfragen">Rechenfragen</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zielgruppe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zielgruppe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Bachelor Wirtschaftsinformatik"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="z.B. SQL, Normalisierung, ER-Modell"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generiere Fragen...
                  </>
                ) : (
                  'Fragen generieren'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQuestionsDialog;