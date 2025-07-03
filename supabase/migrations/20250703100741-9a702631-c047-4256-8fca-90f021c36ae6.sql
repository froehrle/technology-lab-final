-- Create view for first attempts per student per question
CREATE OR REPLACE VIEW public.student_first_attempts AS
SELECT DISTINCT ON (student_id, question_id) 
  *
FROM public.student_answers
ORDER BY student_id, question_id, answered_at ASC;

-- Create view for all attempts (alias for student_answers for consistency)
CREATE OR REPLACE VIEW public.student_all_attempts AS
SELECT * FROM public.student_answers;

-- Update the get_course_perfect_completions function to accept attempt type parameter
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
DECLARE
  source_table text;
BEGIN
  -- Determine which view/table to use based on attempt_type
  CASE attempt_type
    WHEN 'first' THEN source_table := 'public.student_first_attempts';
    WHEN 'latest' THEN source_table := 'public.student_latest_answers';
    WHEN 'all' THEN source_table := 'public.student_all_attempts';
    ELSE source_table := 'public.student_latest_answers';
  END CASE;

  RETURN QUERY EXECUTE format('
    WITH course_questions AS (
      SELECT 
        q.course_id,
        COUNT(*) as total_questions
      FROM public.questions q
      WHERE q.course_id = ANY($1)
      GROUP BY q.course_id
    ),
    student_course_progress AS (
      SELECT 
        q.course_id,
        sla.student_id,
        COUNT(*) as questions_answered,
        COUNT(CASE WHEN sla.is_correct THEN 1 END) as correct_answers
      FROM %I sla
      INNER JOIN public.questions q ON q.id = sla.question_id
      WHERE q.course_id = ANY($1)
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
    ORDER BY tspc.course_id
  ', source_table) USING course_ids;
END;
$$;

-- Update the get_perfect_completions function to accept attempt type parameter
CREATE OR REPLACE FUNCTION public.get_perfect_completions(
  course_ids uuid[], 
  attempt_type text DEFAULT 'latest'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  perfect_count INTEGER := 0;
  source_table text;
BEGIN
  -- Determine which view/table to use based on attempt_type
  CASE attempt_type
    WHEN 'first' THEN source_table := 'public.student_first_attempts';
    WHEN 'latest' THEN source_table := 'public.student_latest_answers';
    WHEN 'all' THEN source_table := 'public.student_all_attempts';
    ELSE source_table := 'public.student_latest_answers';
  END CASE;

  EXECUTE format('
    SELECT COUNT(*)::integer
    FROM (
      SELECT DISTINCT student_id
      FROM (
        WITH course_questions AS (
          SELECT 
            q.course_id,
            COUNT(*) as total_questions
          FROM public.questions q
          WHERE q.course_id = ANY($1)
          GROUP BY q.course_id
        ),
        student_course_progress AS (
          SELECT 
            q.course_id,
            sla.student_id,
            COUNT(*) as questions_answered,
            COUNT(CASE WHEN sla.is_correct THEN 1 END) as correct_answers
          FROM %I sla
          INNER JOIN public.questions q ON q.id = sla.question_id
          WHERE q.course_id = ANY($1)
          GROUP BY q.course_id, sla.student_id
        )
        SELECT scp.student_id
        FROM student_course_progress scp
        INNER JOIN course_questions cq ON cq.course_id = scp.course_id
        WHERE scp.questions_answered = cq.total_questions
          AND scp.correct_answers = cq.total_questions
      ) perfect_students
    ) unique_perfect_students
  ', source_table) INTO perfect_count USING course_ids;
  
  RETURN perfect_count;
END;
$$;