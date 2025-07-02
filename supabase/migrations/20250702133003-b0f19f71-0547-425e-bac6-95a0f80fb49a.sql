
-- Add UPDATE policy for student_answers to allow upsert operations
CREATE POLICY "Students can update their own answers" 
  ON public.student_answers 
  FOR UPDATE 
  USING (auth.uid() = student_id);
