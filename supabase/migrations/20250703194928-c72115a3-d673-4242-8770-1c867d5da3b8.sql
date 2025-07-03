-- Create pending_questions table for chatbot-generated questions awaiting approval
CREATE TABLE public.pending_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  question_style TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  chat_context JSONB, -- Store the conversation context that led to this question
  teacher_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.pending_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view pending questions for their own courses
CREATE POLICY "Teachers can view pending questions for their own courses" 
ON public.pending_questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = pending_questions.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

-- Policy: Teachers can create pending questions for their own courses
CREATE POLICY "Teachers can create pending questions for their own courses" 
ON public.pending_questions 
FOR INSERT 
WITH CHECK (
  auth.uid() = teacher_id AND
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = pending_questions.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

-- Policy: Teachers can update pending questions for their own courses
CREATE POLICY "Teachers can update pending questions for their own courses" 
ON public.pending_questions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = pending_questions.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

-- Policy: Teachers can delete pending questions for their own courses
CREATE POLICY "Teachers can delete pending questions for their own courses" 
ON public.pending_questions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = pending_questions.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pending_questions_updated_at
BEFORE UPDATE ON public.pending_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();