
-- Add focus_points column to quiz_attempts table to replace lives_remaining
ALTER TABLE public.quiz_attempts 
ADD COLUMN focus_points INTEGER DEFAULT 100;

-- Add attempt_count column to student_answers to track attempts per question
ALTER TABLE public.student_answers 
ADD COLUMN attempt_count INTEGER DEFAULT 1;

-- Add xp_earned column to student_answers to track XP per question
ALTER TABLE public.student_answers 
ADD COLUMN xp_earned INTEGER DEFAULT 0;

-- Remove the lives_remaining column (optional, can be kept for backwards compatibility)
-- ALTER TABLE public.quiz_attempts DROP COLUMN lives_remaining;
