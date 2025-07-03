-- Remove the unique constraint on student_answers to allow multiple attempts
ALTER TABLE public.student_answers DROP CONSTRAINT IF EXISTS student_answers_student_id_question_id_key;

-- Add quiz_attempt_id to link answers to specific quiz attempts
ALTER TABLE public.student_answers ADD COLUMN quiz_attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_student_answers_quiz_attempt ON public.student_answers(quiz_attempt_id);
CREATE INDEX idx_student_answers_student_question ON public.student_answers(student_id, question_id);

-- Update existing student_answers to link them to their quiz attempts
-- This matches answers to quiz attempts based on student_id, course_id, and timing
UPDATE public.student_answers 
SET quiz_attempt_id = (
  SELECT qa.id 
  FROM public.quiz_attempts qa 
  INNER JOIN public.questions q ON q.id = student_answers.question_id
  WHERE qa.student_id = student_answers.student_id 
    AND qa.course_id = q.course_id
    AND qa.created_at <= student_answers.answered_at
  ORDER BY qa.created_at DESC 
  LIMIT 1
)
WHERE quiz_attempt_id IS NULL;

-- Create a view for latest answers per student per question (for current behavior)
CREATE OR REPLACE VIEW public.student_latest_answers AS
SELECT DISTINCT ON (student_id, question_id) 
  *
FROM public.student_answers
ORDER BY student_id, question_id, answered_at DESC;

-- Update the difficult_questions_stats view to use all attempts for more accurate analytics
DROP VIEW IF EXISTS public.difficult_questions_stats;
CREATE VIEW public.difficult_questions_stats AS
SELECT 
  q.id as question_id,
  q.question_text,
  q.course_id,
  c.title as course_title,
  COUNT(sa.id) as total_answers,
  COUNT(CASE WHEN sa.is_correct = false THEN 1 END) as wrong_answers,
  ROUND(
    (COUNT(CASE WHEN sa.is_correct = false THEN 1 END)::decimal / COUNT(sa.id)) * 100, 
    2
  ) as wrong_percentage,
  ROUND(AVG(sa.attempt_count), 2) as avg_attempts
FROM public.questions q
INNER JOIN public.courses c ON c.id = q.course_id
LEFT JOIN public.student_answers sa ON sa.question_id = q.id
WHERE sa.id IS NOT NULL
GROUP BY q.id, q.question_text, q.course_id, c.title
HAVING COUNT(sa.id) >= 3  -- Only include questions with at least 3 attempts for statistical significance
ORDER BY wrong_percentage DESC, avg_attempts DESC;