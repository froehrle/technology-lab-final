import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Clock, MessageSquare } from 'lucide-react';
import { parseQuestionOptions } from '@/utils/questionOptions';

interface PendingQuestion {
  id: string;
  question_text: string;
  question_type: string;
  question_style: string;
  options: any;
  correct_answer: string;
  chat_context: any;
  status: string;
  created_at: string;
  review_notes: string | null;
}

interface QuestionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onQuestionsReviewed: () => void;
}

const QuestionReviewDialog = ({
  open,
  onOpenChange,
  courseId,
  onQuestionsReviewed,
}: QuestionReviewDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});

  const { data: pendingQuestions = [], refetch } = useQuery({
    queryKey: ['pending-questions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pending_questions')
        .select('*')
        .eq('course_id', courseId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingQuestion[];
    },
    enabled: open && !!courseId,
  });

  const handleApproveQuestion = async (question: PendingQuestion) => {
    setIsProcessing(prev => ({ ...prev, [question.id]: true }));
    
    try {
      // Move question to questions table
      const { error: insertError } = await supabase
        .from('questions')
        .insert({
          course_id: courseId,
          question_text: question.question_text,
          question_type: question.question_type,
          question_style: question.question_style,
          options: question.options ? JSON.stringify(question.options) : null,
          correct_answer: question.correct_answer,
        });

      if (insertError) throw insertError;

      // Update pending question status
      const { error: updateError } = await supabase
        .from('pending_questions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes[question.id] || null,
        })
        .eq('id', question.id);

      if (updateError) throw updateError;

      toast({
        title: "Frage genehmigt",
        description: "Die Frage wurde erfolgreich zum Kurs hinzugefügt.",
      });

      refetch();
      onQuestionsReviewed();
    } catch (error) {
      console.error('Error approving question:', error);
      toast({
        title: "Fehler",
        description: "Die Frage konnte nicht genehmigt werden.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const handleRejectQuestion = async (question: PendingQuestion) => {
    setIsProcessing(prev => ({ ...prev, [question.id]: true }));
    
    try {
      const { error } = await supabase
        .from('pending_questions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes[question.id] || null,
        })
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Frage abgelehnt",
        description: "Die Frage wurde abgelehnt.",
      });

      refetch();
    } catch (error) {
      console.error('Error rejecting question:', error);
      toast({
        title: "Fehler",
        description: "Die Frage konnte nicht abgelehnt werden.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const formatQuestionOptions = (options: any) => {
    const parsedOptions = parseQuestionOptions(options);
    if (parsedOptions.length === 0) return null;
    
    return parsedOptions.map((option, index) => (
      <div key={index} className="flex items-center gap-2">
        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
          {String.fromCharCode(65 + index)}
        </Badge>
        <span>{option}</span>
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Fragen überprüfen ({pendingQuestions.length} ausstehend)
          </DialogTitle>
        </DialogHeader>

        {pendingQuestions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Keine ausstehenden Fragen zur Überprüfung.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingQuestions.map((question) => (
              <Card key={question.id} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{question.question_text}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{question.question_style}</Badge>
                      <Badge variant="outline">{question.question_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {question.options && (
                    <div>
                      <h4 className="font-medium mb-2">Antwortmöglichkeiten:</h4>
                      <div className="space-y-1">
                        {formatQuestionOptions(question.options)}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-green-700">Richtige Antwort:</h4>
                    <p className="text-green-600 font-medium">{question.correct_answer}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Notizen (optional):</h4>
                    <Textarea
                      placeholder="Fügen Sie Notizen zu dieser Frage hinzu..."
                      value={reviewNotes[question.id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [question.id]: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectQuestion(question)}
                      disabled={isProcessing[question.id]}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Ablehnen
                    </Button>
                    <Button
                      onClick={() => handleApproveQuestion(question)}
                      disabled={isProcessing[question.id]}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Genehmigen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionReviewDialog;