-- Fix the perfect completions functions to use DISTINCT question_id
-- This addresses the issue where students with multiple attempts per question
-- are not counted as having perfect completions

-- Drop and recreate the functions with corrected logic
DROP FUNCTION IF EXISTS public.get_perfect_completions_latest(uuid[]);
DROP FUNCTION IF EXISTS public.get_perfect_completions_first(uuid[]);
DROP FUNCTION IF EXISTS public.get_perfect_completions_all(uuid[]);

-- Fixed function for latest attempts
CREATE OR REPLACE FUNCTION public.get_perfect_completions_latest(course_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  perfect_count INTEGER := 0;
BEGIN
  SELECT COUNT(*)::integer INTO perfect_count
  FROM (
    SELECT DISTINCT student_id
    FROM (
      WITH course_questions AS (
        SELECT 
          q.course_id,
          COUNT(*) as total_questions
        FROM public.questions q
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id
      ),
      student_course_progress AS (
        SELECT 
          q.course_id,
          sla.student_id,
          COUNT(DISTINCT sla.question_id) as questions_answered, -- Use DISTINCT here
          COUNT(DISTINCT CASE WHEN sla.is_correct THEN sla.question_id END) as correct_questions -- Use DISTINCT here
        FROM public.student_latest_answers sla
        INNER JOIN public.questions q ON q.id = sla.question_id
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id, sla.student_id
      )
      SELECT scp.student_id
      FROM student_course_progress scp
      INNER JOIN course_questions cq ON cq.course_id = scp.course_id
      WHERE scp.questions_answered = cq.total_questions
        AND scp.correct_questions = cq.total_questions
    ) perfect_students
  ) unique_perfect_students;
  
  RETURN perfect_count;
END;
$$;

-- Fixed function for first attempts  
CREATE OR REPLACE FUNCTION public.get_perfect_completions_first(course_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  perfect_count INTEGER := 0;
BEGIN
  SELECT COUNT(*)::integer INTO perfect_count
  FROM (
    SELECT DISTINCT student_id
    FROM (
      WITH course_questions AS (
        SELECT 
          q.course_id,
          COUNT(*) as total_questions
        FROM public.questions q
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id
      ),
      student_course_progress AS (
        SELECT 
          q.course_id,
          sfa.student_id,
          COUNT(DISTINCT sfa.question_id) as questions_answered, -- Use DISTINCT here
          COUNT(DISTINCT CASE WHEN sfa.is_correct THEN sfa.question_id END) as correct_questions -- Use DISTINCT here
        FROM public.student_first_attempts sfa
        INNER JOIN public.questions q ON q.id = sfa.question_id
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id, sfa.student_id
      )
      SELECT scp.student_id
      FROM student_course_progress scp
      INNER JOIN course_questions cq ON cq.course_id = scp.course_id
      WHERE scp.questions_answered = cq.total_questions
        AND scp.correct_questions = cq.total_questions
    ) perfect_students
  ) unique_perfect_students;
  
  RETURN perfect_count;
END;
$$;

-- Fixed function for all attempts
CREATE OR REPLACE FUNCTION public.get_perfect_completions_all(course_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  perfect_count INTEGER := 0;
BEGIN
  SELECT COUNT(*)::integer INTO perfect_count
  FROM (
    SELECT DISTINCT student_id
    FROM (
      WITH course_questions AS (
        SELECT 
          q.course_id,
          COUNT(*) as total_questions
        FROM public.questions q
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id
      ),
      student_course_progress AS (
        SELECT 
          q.course_id,
          sa.student_id,
          COUNT(DISTINCT sa.question_id) as questions_answered, -- Use DISTINCT here
          COUNT(DISTINCT CASE WHEN sa.is_correct THEN sa.question_id END) as correct_questions -- Use DISTINCT here
        FROM public.student_answers sa
        INNER JOIN public.questions q ON q.id = sa.question_id
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id, sa.student_id
      )
      SELECT scp.student_id
      FROM student_course_progress scp
      INNER JOIN course_questions cq ON cq.course_id = scp.course_id
      WHERE scp.questions_answered = cq.total_questions
        AND scp.correct_questions = cq.total_questions
    ) perfect_students
  ) unique_perfect_students;
  
  RETURN perfect_count;
END;
$$;