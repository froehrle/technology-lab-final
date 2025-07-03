-- Create student_streaks table to track daily activity streaks
CREATE TABLE public.student_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_streaks ENABLE ROW LEVEL SECURITY;

-- Students can view their own streaks
CREATE POLICY "Students can view their own streaks" 
  ON public.student_streaks 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Students can insert their own streaks
CREATE POLICY "Students can insert their own streaks" 
  ON public.student_streaks 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own streaks
CREATE POLICY "Students can update their own streaks" 
  ON public.student_streaks 
  FOR UPDATE 
  USING (auth.uid() = student_id);

-- Function to update streak when student answers questions
CREATE OR REPLACE FUNCTION public.update_student_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  last_activity DATE;
  current_streak_count INTEGER := 0;
  longest_streak_count INTEGER := 0;
BEGIN
  -- Only process if this is a correct answer (to maintain quality streaks)
  IF NEW.is_correct = true THEN
    -- Get current streak data
    SELECT last_activity_date, current_streak, longest_streak 
    INTO last_activity, current_streak_count, longest_streak_count
    FROM public.student_streaks 
    WHERE student_id = NEW.student_id;
    
    -- If no streak record exists, create one
    IF last_activity IS NULL THEN
      INSERT INTO public.student_streaks (student_id, current_streak, longest_streak, last_activity_date)
      VALUES (NEW.student_id, 1, 1, today_date);
    ELSE
      -- If student was active yesterday, continue streak
      IF last_activity = yesterday_date THEN
        current_streak_count := current_streak_count + 1;
        longest_streak_count := GREATEST(longest_streak_count, current_streak_count);
        
        UPDATE public.student_streaks 
        SET 
          current_streak = current_streak_count,
          longest_streak = longest_streak_count,
          last_activity_date = today_date,
          updated_at = now()
        WHERE student_id = NEW.student_id;
        
      -- If student was active today already, don't change streak
      ELSIF last_activity = today_date THEN
        -- Do nothing, already counted for today
        NULL;
        
      -- If gap of more than 1 day, reset streak
      ELSIF last_activity < yesterday_date THEN
        UPDATE public.student_streaks 
        SET 
          current_streak = 1,
          longest_streak = GREATEST(longest_streak_count, 1),
          last_activity_date = today_date,
          updated_at = now()
        WHERE student_id = NEW.student_id;
        
      -- If student is active today for first time (last activity was today-1), continue
      ELSE
        UPDATE public.student_streaks 
        SET 
          last_activity_date = today_date,
          updated_at = now()
        WHERE student_id = NEW.student_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update streaks on new correct answers
CREATE TRIGGER update_streak_on_answer
  AFTER INSERT ON public.student_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_streak();

-- Function to reset streaks for inactive students (to be called daily)
CREATE OR REPLACE FUNCTION public.reset_inactive_streaks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reset_count INTEGER := 0;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Reset streaks for students who haven't been active yesterday
  UPDATE public.student_streaks 
  SET 
    current_streak = 0,
    updated_at = now()
  WHERE last_activity_date < yesterday_date 
    AND current_streak > 0;
    
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$;