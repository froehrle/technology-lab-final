-- Create function to award coins for course completion
CREATE OR REPLACE FUNCTION public.award_coins_for_course_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only award coins if this is the first completion (completed_at was NULL before)
  IF OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL THEN
    -- Award 500 coins for course completion
    INSERT INTO public.student_coins (student_id, total_coins)
    VALUES (NEW.student_id, 500)
    ON CONFLICT (student_id)
    DO UPDATE SET 
      total_coins = student_coins.total_coins + 500,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to award coins when a course is completed
CREATE TRIGGER award_coins_for_course_completion_trigger
  AFTER UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.award_coins_for_course_completion();