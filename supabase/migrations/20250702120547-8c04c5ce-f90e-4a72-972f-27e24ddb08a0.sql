
-- Create a table for questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view questions for their own courses
CREATE POLICY "Teachers can view questions for their own courses" 
  ON public.questions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = questions.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

-- Policy: Teachers can create questions for their own courses
CREATE POLICY "Teachers can create questions for their own courses" 
  ON public.questions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = questions.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

-- Policy: Teachers can update questions for their own courses
CREATE POLICY "Teachers can update questions for their own courses" 
  ON public.questions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = questions.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

-- Policy: Teachers can delete questions for their own courses
CREATE POLICY "Teachers can delete questions for their own courses" 
  ON public.questions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = questions.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );
