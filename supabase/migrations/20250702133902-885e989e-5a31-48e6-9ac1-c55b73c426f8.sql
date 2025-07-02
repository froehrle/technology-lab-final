
-- Drop the existing trigger
DROP TRIGGER IF EXISTS update_xp_and_achievements_trigger ON public.student_answers;

-- Create a new trigger that fires on both INSERT and UPDATE
CREATE TRIGGER update_xp_and_achievements_trigger
  AFTER INSERT OR UPDATE ON public.student_answers
  FOR EACH ROW
  WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION public.update_student_xp_and_achievements();
