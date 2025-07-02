
-- First, let's check the current trigger function and fix it
-- The issue is that the function is trying to reference OLD.xp_earned but 
-- the student_answers table doesn't have this column in the original schema

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS update_xp_and_achievements_trigger ON public.student_answers;
DROP FUNCTION IF EXISTS public.update_student_xp_and_achievements();

-- Create a corrected trigger function that properly handles XP calculation
CREATE OR REPLACE FUNCTION public.update_student_xp_and_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  xp_difference INTEGER;
BEGIN
  -- Calculate XP difference based on operation type
  IF TG_OP = 'INSERT' THEN
    -- For new answers, add the full XP amount
    xp_difference := NEW.xp_earned;
  ELSIF TG_OP = 'UPDATE' THEN
    -- For updated answers, calculate the difference between old and new XP
    -- Only add XP if the new XP is greater than the old XP
    xp_difference := NEW.xp_earned - COALESCE(OLD.xp_earned, 0);
  END IF;

  -- Only proceed if there's a positive XP change
  IF xp_difference > 0 THEN
    -- Update or insert student's total XP
    INSERT INTO public.student_xp (student_id, total_xp)
    VALUES (NEW.student_id, xp_difference)
    ON CONFLICT (student_id)
    DO UPDATE SET 
      total_xp = student_xp.total_xp + xp_difference,
      updated_at = now();

    -- Check for new achievements only if XP increased
    INSERT INTO public.student_achievements (student_id, achievement_id)
    SELECT NEW.student_id, a.id
    FROM public.achievements a
    LEFT JOIN public.student_achievements sa ON sa.student_id = NEW.student_id AND sa.achievement_id = a.id
    WHERE sa.id IS NULL -- Achievement not yet earned
      AND a.xp_required <= (
        SELECT total_xp FROM public.student_xp WHERE student_id = NEW.student_id
      );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger that fires on both INSERT and UPDATE
CREATE TRIGGER update_xp_and_achievements_trigger
  AFTER INSERT OR UPDATE ON public.student_answers
  FOR EACH ROW
  WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION public.update_student_xp_and_achievements();
