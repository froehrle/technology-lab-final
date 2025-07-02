
-- Create table to track student XP across all courses
CREATE TABLE public.student_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable RLS for student_xp
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;

-- Students can view their own XP
CREATE POLICY "Students can view their own XP"
  ON public.student_xp
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own XP record
CREATE POLICY "Students can insert their own XP"
  ON public.student_xp
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own XP
CREATE POLICY "Students can update their own XP"
  ON public.student_xp
  FOR UPDATE
  USING (auth.uid() = student_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, xp_required) VALUES
('Erste Schritte', 'Verdiene deine ersten 10 XP', 'star', 10),
('Fleißiger Lerner', 'Sammle 50 XP', 'book-open', 50),
('Wissenssammler', 'Erreiche 100 XP', 'graduation-cap', 100),
('Experte', 'Sammle 250 XP', 'trophy', 250),
('Meister', 'Erreiche 500 XP', 'crown', 500),
('Legende', 'Sammle unglaubliche 1000 XP', 'zap', 1000);

-- Enable RLS for achievements (read-only for students)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can view achievements
CREATE POLICY "Everyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Create student achievements junction table
CREATE TABLE public.student_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- Enable RLS for student_achievements
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

-- Students can view their own achievements
CREATE POLICY "Students can view their own achievements"
  ON public.student_achievements
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own achievements
CREATE POLICY "Students can insert their own achievements"
  ON public.student_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Create function to update total XP and check for new achievements
CREATE OR REPLACE FUNCTION public.update_student_xp_and_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert student's total XP
  INSERT INTO public.student_xp (student_id, total_xp)
  VALUES (NEW.student_id, NEW.xp_earned)
  ON CONFLICT (student_id)
  DO UPDATE SET 
    total_xp = student_xp.total_xp + NEW.xp_earned,
    updated_at = now();

  -- Check for new achievements
  INSERT INTO public.student_achievements (student_id, achievement_id)
  SELECT NEW.student_id, a.id
  FROM public.achievements a
  LEFT JOIN public.student_achievements sa ON sa.student_id = NEW.student_id AND sa.achievement_id = a.id
  WHERE sa.id IS NULL -- Achievement not yet earned
    AND a.xp_required <= (
      SELECT total_xp FROM public.student_xp WHERE student_id = NEW.student_id
    );

  RETURN NEW;
END;
$$;

-- Create trigger to automatically update XP and check achievements when answers are submitted
CREATE TRIGGER update_xp_and_achievements_trigger
  AFTER INSERT ON public.student_answers
  FOR EACH ROW
  WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION public.update_student_xp_and_achievements();
