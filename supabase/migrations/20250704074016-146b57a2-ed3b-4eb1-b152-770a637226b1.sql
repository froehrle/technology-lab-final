-- Allow teachers to view all student XP for anonymized leaderboard analytics
CREATE POLICY "Teachers can view all student XP for analytics" 
ON public.student_xp 
FOR SELECT 
TO authenticated 
USING (public.is_teacher(auth.uid()));