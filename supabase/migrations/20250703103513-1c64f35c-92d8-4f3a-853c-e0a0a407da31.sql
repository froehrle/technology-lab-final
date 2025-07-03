-- Fix the course-level perfect completions function to use DISTINCT question_id
DROP FUNCTION IF EXISTS public.get_course_perfect_completions_latest(uuid[]);

CREATE OR REPLACE FUNCTION public.get_course_perfect_completions_latest(course_ids uuid[])
RETURNS TABLE(
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
      COUNT(DISTINCT sla.question_id) as questions_answered, -- Use DISTINCT here
      COUNT(DISTINCT CASE WHEN sla.is_correct THEN sla.question_id END) as correct_questions -- Use DISTINCT here
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
      AND scp.correct_questions = cq.total_questions
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