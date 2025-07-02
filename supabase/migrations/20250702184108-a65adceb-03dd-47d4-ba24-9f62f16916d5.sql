-- Add policies for teachers to view their students' data
CREATE POLICY "Teachers can view enrollments for their courses" 
ON public.course_enrollments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = course_enrollments.course_id 
  AND courses.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can view quiz attempts for their courses" 
ON public.quiz_attempts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = quiz_attempts.course_id 
  AND courses.teacher_id = auth.uid()
));