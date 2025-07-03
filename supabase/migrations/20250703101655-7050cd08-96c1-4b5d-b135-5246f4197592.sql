-- Clean up remaining student data that wasn't deleted
DELETE FROM public.student_answers;
DELETE FROM public.quiz_attempts;
DELETE FROM public.course_enrollments;
DELETE FROM public.student_xp;
DELETE FROM public.student_coins;
DELETE FROM public.student_streaks;
DELETE FROM public.student_achievements;
DELETE FROM public.student_purchases;
DELETE FROM public.student_badge_purchases;
DELETE FROM public.student_farm_purchases;