
-- Create a table to track quiz attempts and completion status
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  lives_remaining INTEGER DEFAULT 5,
  current_score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Students can view their own quiz attempts
CREATE POLICY "Students can view their own quiz attempts" 
  ON public.quiz_attempts 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Students can create their own quiz attempts
CREATE POLICY "Students can create quiz attempts" 
  ON public.quiz_attempts 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own quiz attempts
CREATE POLICY "Students can update their own quiz attempts" 
  ON public.quiz_attempts 
  FOR UPDATE 
  USING (auth.uid() = student_id);
