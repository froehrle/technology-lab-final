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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Clock, MessageSquare, Edit, Save, XCircle } from 'lucide-react';
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
  const [editingQuestions, setEditingQuestions] = useState<{ [key: string]: boolean }>({});
  const [editedQuestions, setEditedQuestions] = useState<{ [key: string]: Partial<PendingQuestion> }>({});

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
      // Use edited data if available, otherwise use original
      const editedData = editedQuestions[question.id] || {};
      const finalQuestionData = {
        question_text: editedData.question_text || question.question_text,
        options: editedData.options || question.options,
        correct_answer: editedData.correct_answer || question.correct_answer,
      };

      // Move question to questions table
      const { error: insertError } = await supabase
        .from('questions')
        .insert({
          course_id: courseId,
          question_text: finalQuestionData.question_text,
          question_type: question.question_type,
          question_style: question.question_style,
          options: finalQuestionData.options ? JSON.stringify(finalQuestionData.options) : null,
          correct_answer: finalQuestionData.correct_answer,
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

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestions(prev => ({ ...prev, [questionId]: true }));
  };

  const handleSaveEdit = async (question: PendingQuestion) => {
    setIsProcessing(prev => ({ ...prev, [question.id]: true }));
    
    try {
      const editedData = editedQuestions[question.id] || {};
      const { error } = await supabase
        .from('pending_questions')
        .update({
          question_text: editedData.question_text || question.question_text,
          options: editedData.options || question.options,
          correct_answer: editedData.correct_answer || question.correct_answer,
          updated_at: new Date().toISOString(),
        })
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Frage aktualisiert",
        description: "Die Änderungen wurden gespeichert.",
      });

      setEditingQuestions(prev => ({ ...prev, [question.id]: false }));
      setEditedQuestions(prev => ({ ...prev, [question.id]: {} }));
      refetch();
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Fehler",
        description: "Die Frage konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const handleCancelEdit = (questionId: string) => {
    setEditingQuestions(prev => ({ ...prev, [questionId]: false }));
    setEditedQuestions(prev => ({ ...prev, [questionId]: {} }));
  };

  const updateEditedQuestion = (questionId: string, field: keyof PendingQuestion, value: any) => {
    setEditedQuestions(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value }
    }));
  };

  const getCurrentQuestionData = (question: PendingQuestion, field: keyof PendingQuestion) => {
    return editedQuestions[question.id]?.[field] ?? question[field];
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
                    <div className="flex-1">
                      {editingQuestions[question.id] ? (
                        <Input
                          value={getCurrentQuestionData(question, 'question_text') as string}
                          onChange={(e) => updateEditedQuestion(question.id, 'question_text', e.target.value)}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        <CardTitle className="text-lg">{question.question_text}</CardTitle>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {editingQuestions[question.id] ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveEdit(question)}
                            disabled={isProcessing[question.id]}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelEdit(question.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditQuestion(question.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Badge variant="secondary">{question.question_style}</Badge>
                      <Badge variant="outline">{question.question_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {question.options && (
                    <div>
                      <h4 className="font-medium mb-2">Antwortmöglichkeiten:</h4>
                      {editingQuestions[question.id] ? (
                        <div className="space-y-2">
                          {(() => {
                            const currentOptions = getCurrentQuestionData(question, 'options');
                            const parsedOptions = parseQuestionOptions(currentOptions);
                            return parsedOptions.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + index)}
                                </Badge>
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...parsedOptions];
                                    newOptions[index] = e.target.value;
                                    updateEditedQuestion(question.id, 'options', newOptions);
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            ));
                          })()}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {formatQuestionOptions(question.options)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-green-700">Richtige Antwort:</h4>
                    {editingQuestions[question.id] ? (
                      <Input
                        value={getCurrentQuestionData(question, 'correct_answer') as string || ''}
                        onChange={(e) => updateEditedQuestion(question.id, 'correct_answer', e.target.value)}
                        className="text-green-600 font-medium"
                      />
                    ) : (
                      <p className="text-green-600 font-medium">{question.correct_answer}</p>
                    )}
                  </div>


                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {!editingQuestions[question.id] && (
                      <>
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
                      </>
                    )}
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