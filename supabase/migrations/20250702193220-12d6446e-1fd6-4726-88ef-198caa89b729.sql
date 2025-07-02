-- Create analytics views and optimizations for better performance

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_completed_at ON public.course_enrollments(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON public.quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON public.quiz_attempts(is_completed) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_student_answers_question_id ON public.student_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON public.student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_correct ON public.student_answers(is_correct);
CREATE INDEX IF NOT EXISTS idx_questions_course_id ON public.questions(course_id);

-- Create a view for course completion stats
CREATE OR REPLACE VIEW public.course_completion_stats AS
SELECT 
  c.id as course_id,
  c.title,
  c.teacher_id,
  COUNT(ce.id) as total_enrollments,
  COUNT(ce.completed_at) as completions,
  CASE 
    WHEN COUNT(ce.id) > 0 
    THEN ROUND((COUNT(ce.completed_at)::numeric / COUNT(ce.id)::numeric) * 100, 1)
    ELSE 0 
  END as completion_rate
FROM public.courses c
LEFT JOIN public.course_enrollments ce ON c.id = ce.course_id
GROUP BY c.id, c.title, c.teacher_id;

-- Create a view for difficult questions analysis
CREATE OR REPLACE VIEW public.difficult_questions_stats AS
SELECT 
  q.id as question_id,
  q.question_text,
  q.course_id,
  c.title as course_title,
  COUNT(sa.id) as total_answers,
  COUNT(CASE WHEN sa.is_correct = false THEN 1 END) as wrong_answers,
  ROUND(AVG(sa.attempt_count), 2) as avg_attempts,
  ROUND((COUNT(CASE WHEN sa.is_correct = false THEN 1 END)::numeric / COUNT(sa.id)::numeric) * 100, 1) as wrong_percentage
FROM public.questions q
INNER JOIN public.courses c ON q.course_id = c.id
LEFT JOIN public.student_answers sa ON q.id = sa.question_id
GROUP BY q.id, q.question_text, q.course_id, c.title
HAVING COUNT(sa.id) > 0;

-- Create a function to efficiently calculate perfect completions for a course
CREATE OR REPLACE FUNCTION public.get_perfect_completions(course_ids uuid[])
RETURNS INTEGER AS $$
DECLARE
  perfect_count INTEGER := 0;
  course_record RECORD;
  attempt_record RECORD;
  total_questions INTEGER;
  correct_answers INTEGER;
BEGIN
  -- Loop through each course
  FOR course_record IN 
    SELECT DISTINCT c.id, c.title
    FROM public.courses c
    WHERE c.id = ANY(course_ids)
  LOOP
    -- Get total questions for this course
    SELECT COUNT(*) INTO total_questions
    FROM public.questions q
    WHERE q.course_id = course_record.id;
    
    -- Skip if no questions
    IF total_questions = 0 THEN
      CONTINUE;
    END IF;
    
    -- Loop through completed attempts for this course
    FOR attempt_record IN
      SELECT DISTINCT qa.student_id
      FROM public.quiz_attempts qa
      WHERE qa.course_id = course_record.id 
      AND qa.is_completed = true
    LOOP
      -- Count correct answers for this student in this course
      SELECT COUNT(*) INTO correct_answers
      FROM public.student_answers sa
      INNER JOIN public.questions q ON sa.question_id = q.id
      WHERE q.course_id = course_record.id
      AND sa.student_id = attempt_record.student_id
      AND sa.is_correct = true;
      
      -- Check if student answered all questions correctly
      IF correct_answers = total_questions THEN
        perfect_count := perfect_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN perfect_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for dropout analysis
CREATE OR REPLACE VIEW public.dropout_analysis AS
SELECT 
  c.title as course_title,
  qa.current_question_index,
  COUNT(*) as dropout_count
FROM public.quiz_attempts qa
INNER JOIN public.courses c ON qa.course_id = c.id
WHERE qa.is_completed = false
GROUP BY c.title, qa.current_question_index
ORDER BY dropout_count DESC;