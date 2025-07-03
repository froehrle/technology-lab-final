-- Create function to get course perfect completions (all questions answered correctly)
CREATE OR REPLACE FUNCTION public.get_course_perfect_completions(course_ids uuid[])
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
    -- Get total questions per course
    SELECT 
      q.course_id,
      COUNT(*) as total_questions
    FROM public.questions q
    WHERE q.course_id = ANY(course_ids)
    GROUP BY q.course_id
  ),
  student_course_progress AS (
    -- Get students with answers for each course
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
    -- Find students who answered all questions correctly
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
    -- Count total students who attempted each course
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