-- Comprehensive cleanup: Remove unused app_themes system and clean up database

-- Step 1: Remove foreign key constraints and theme_id column from student_purchases
ALTER TABLE public.student_purchases DROP CONSTRAINT IF EXISTS student_purchases_theme_id_fkey;
ALTER TABLE public.student_purchases DROP COLUMN IF EXISTS theme_id;

-- Step 2: Drop the unused app_themes table entirely
DROP TABLE IF EXISTS public.app_themes;

-- Step 3: Confirm removal of course_materials table (already done, but ensuring)
DROP TABLE IF EXISTS public.course_materials;