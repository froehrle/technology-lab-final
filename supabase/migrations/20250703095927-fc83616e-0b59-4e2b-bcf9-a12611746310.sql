-- Update the existing get_perfect_completions function to use corrected logic
DROP FUNCTION IF EXISTS public.get_perfect_completions(uuid[]);

CREATE OR REPLACE FUNCTION public.get_perfect_completions(course_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  perfect_count INTEGER := 0;
BEGIN
  -- Count students who have perfect completions across the specified courses
  SELECT COUNT(*)::integer INTO perfect_count
  FROM (
    SELECT DISTINCT student_id
    FROM (
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
      )
      -- Find students who answered all questions correctly in any course
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