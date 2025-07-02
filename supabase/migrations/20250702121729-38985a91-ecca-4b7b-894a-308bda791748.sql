
-- Allow students to view all courses (read-only access)
CREATE POLICY "Students can view all courses" 
  ON public.courses 
  FOR SELECT 
  USING (true);
