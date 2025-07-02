
-- Remove the points column from the questions table since it's not being used
ALTER TABLE public.questions DROP COLUMN IF EXISTS points;
