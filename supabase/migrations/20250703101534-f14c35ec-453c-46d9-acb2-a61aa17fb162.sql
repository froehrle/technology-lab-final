-- Delete all student data in correct order to respect foreign key constraints

-- Phase 1: Delete student activity data
DELETE FROM public.student_answers WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.quiz_attempts WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.course_enrollments WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

-- Phase 2: Delete student progress & rewards
DELETE FROM public.student_xp WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.student_coins WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.student_streaks WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.student_achievements WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

-- Phase 3: Delete student purchases
DELETE FROM public.student_purchases WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.student_badge_purchases WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

DELETE FROM public.student_farm_purchases WHERE student_id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);

-- Phase 4: Delete student profiles
DELETE FROM public.profiles WHERE role = 'student';