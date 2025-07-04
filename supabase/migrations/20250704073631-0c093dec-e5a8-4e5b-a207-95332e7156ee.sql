-- Allow students to view all XP for leaderboard
CREATE POLICY "Students can view all XP for leaderboard" 
ON public.student_xp 
FOR SELECT 
TO authenticated 
USING (public.is_student(auth.uid()));

-- Allow students to view basic profile info of other students
CREATE POLICY "Students can view other students' profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (public.is_student(auth.uid()));

-- Allow students to view equipped badges of other students
CREATE POLICY "Students can view equipped badges of others" 
ON public.student_badge_purchases 
FOR SELECT 
TO authenticated 
USING (public.is_student(auth.uid()) AND is_equipped = true);

-- Allow students to view equipped avatar items of other students
CREATE POLICY "Students can view equipped avatar items of others" 
ON public.student_purchases 
FOR SELECT 
TO authenticated 
USING (public.is_student(auth.uid()) AND is_equipped = true AND purchase_type = 'avatar_item');