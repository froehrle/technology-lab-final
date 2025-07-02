
-- Create a table to track student course enrollments
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Students can enroll themselves in courses
CREATE POLICY "Students can enroll in courses" 
  ON public.course_enrollments 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own enrollment progress
CREATE POLICY "Students can update their own progress" 
  ON public.course_enrollments 
  FOR UPDATE 
  USING (auth.uid() = student_id);

-- Create a table to track student answers
CREATE TABLE public.student_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, question_id)
);

-- Enable Row Level Security
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- Students can view their own answers
CREATE POLICY "Students can view their own answers" 
  ON public.student_answers 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Students can submit their own answers
CREATE POLICY "Students can submit answers" 
  ON public.student_answers 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Allow students to view questions for courses they are enrolled in
CREATE POLICY "Students can view questions for enrolled courses" 
  ON public.questions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_enrollments.course_id = questions.course_id 
      AND course_enrollments.student_id = auth.uid()
    )
  );
