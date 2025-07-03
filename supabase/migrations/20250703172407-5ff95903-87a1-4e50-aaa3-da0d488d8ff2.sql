-- Add question_style column to questions table
ALTER TABLE public.questions ADD COLUMN question_style TEXT;

-- Set default value for existing questions
UPDATE public.questions SET question_style = 'Verständnisfragen' WHERE question_style IS NULL;

-- Add constraint to ensure only valid values
ALTER TABLE public.questions ADD CONSTRAINT questions_question_style_check 
CHECK (question_style IN ('Verständnisfragen', 'Rechenfragen'));

-- Make column NOT NULL after setting defaults
ALTER TABLE public.questions ALTER COLUMN question_style SET NOT NULL;