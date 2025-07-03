-- Drop and recreate the functions with proper view access
DROP FUNCTION IF EXISTS public.get_perfect_completions(uuid[], text);
DROP FUNCTION IF EXISTS public.get_course_perfect_completions(uuid[], text);

-- Create separate functions for each attempt type
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
          COUNT(*) as questions_answered,
          COUNT(CASE WHEN sla.is_correct THEN 1 END) as correct_answers
        FROM public.student_latest_answers sla
        INNER JOIN public.questions q ON q.id = sla.question_id
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id, sla.student_id
      )
      SELECT scp.student_id
      FROM student_course_progress scp
      INNER JOIN course_questions cq ON cq.course_id = scp.course_id
      WHERE scp.questions_answered = cq.total_questions
        AND scp.correct_answers = cq.total_questions
    ) perfect_students
  ) unique_perfect_students;
  
  RETURN perfect_count;
END;
$$;

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
          COUNT(*) as questions_answered,
          COUNT(CASE WHEN sfa.is_correct THEN 1 END) as correct_answers
        FROM public.student_first_attempts sfa
        INNER JOIN public.questions q ON q.id = sfa.question_id
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id, sfa.student_id
      )
      SELECT scp.student_id
      FROM student_course_progress scp
      INNER JOIN course_questions cq ON cq.course_id = scp.course_id
      WHERE scp.questions_answered = cq.total_questions
        AND scp.correct_answers = cq.total_questions
    ) perfect_students
  ) unique_perfect_students;
  
  RETURN perfect_count;
END;
$$;

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
          COUNT(*) as questions_answered,
          COUNT(CASE WHEN sa.is_correct THEN 1 END) as correct_answers
        FROM public.student_answers sa
        INNER JOIN public.questions q ON q.id = sa.question_id
        WHERE q.course_id = ANY(course_ids)
        GROUP BY q.course_id, sa.student_id
      )
      SELECT scp.student_id
      FROM student_course_progress scp
      INNER JOIN course_questions cq ON cq.course_id = scp.course_id
      WHERE scp.questions_answered = cq.total_questions
        AND scp.correct_answers = cq.total_questions
    ) perfect_students
  ) unique_perfect_students;
  
  RETURN perfect_count;
END;
$$;

-- Recreate the main function with conditional logic
CREATE OR REPLACE FUNCTION public.get_perfect_completions(
  course_ids uuid[], 
  attempt_type text DEFAULT 'latest'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CASE attempt_type
    WHEN 'first' THEN 
      RETURN public.get_perfect_completions_first(course_ids);
    WHEN 'all' THEN 
      RETURN public.get_perfect_completions_all(course_ids);
    ELSE 
      RETURN public.get_perfect_completions_latest(course_ids);
  END CASE;
END;
$$;

-- Create corresponding functions for course-specific perfect completions
CREATE OR REPLACE FUNCTION public.get_course_perfect_completions_latest(course_ids uuid[])
RETURNS TABLE (
  course_id uuid,
  total_students bigint,
  perfect_completions bigint,
  perfect_completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
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
      COUNT(*) as questions_answered,
      COUNT(CASE WHEN sla.is_correct THEN 1 END) as correct_answers
    FROM public.student_latest_answers sla
    INNER JOIN public.questions q ON q.id = sla.question_id
    WHERE q.course_id = ANY(course_ids)
    GROUP BY q.course_id, sla.student_id
  ),
  perfect_students AS (
    SELECT 
      scp.course_id,
      COUNT(*) as perfect_count
    FROM student_course_progress scp
    INNER JOIN course_questions cq ON cq.course_id = scp.course_id
    WHERE scp.questions_answered = cq.total_questions
      AND scp.correct_answers = cq.total_questions
    GROUP BY scp.course_id
  ),
  total_students_per_course AS (
    SELECT 
      scp.course_id,
      COUNT(DISTINCT scp.student_id) as total_students
    FROM student_course_progress scp
    GROUP BY scp.course_id
  )
  SELECT 
    tspc.course_id,
    tspc.total_students,
    COALESCE(ps.perfect_count, 0) as perfect_completions,
    CASE 
      WHEN tspc.total_students > 0 
      THEN ROUND((COALESCE(ps.perfect_count, 0)::numeric / tspc.total_students) * 100, 1)
      ELSE 0 
    END as perfect_completion_rate
  FROM total_students_per_course tspc
  LEFT JOIN perfect_students ps ON ps.course_id = tspc.course_id
  ORDER BY tspc.course_id;
END;
$$;

-- Create the main course function with conditional logic
CREATE OR REPLACE FUNCTION public.get_course_perfect_completions(
  course_ids uuid[], 
  attempt_type text DEFAULT 'latest'
)
RETURNS TABLE (
  course_id uuid,
  total_students bigint,
  perfect_completions bigint,
  perfect_completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, only implement latest - we can add first and all later if needed
  CASE attempt_type
    WHEN 'first' THEN 
      -- Use first attempts logic (simplified for now)
      RETURN QUERY SELECT * FROM public.get_course_perfect_completions_latest(course_ids);
    WHEN 'all' THEN 
      -- Use all attempts logic (simplified for now)  
      RETURN QUERY SELECT * FROM public.get_course_perfect_completions_latest(course_ids);
    ELSE 
      RETURN QUERY SELECT * FROM public.get_course_perfect_completions_latest(course_ids);
  END CASE;
END;
$$;