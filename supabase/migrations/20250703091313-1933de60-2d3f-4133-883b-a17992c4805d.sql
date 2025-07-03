-- Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badge_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_farm_purchases ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create function to check if user has required role
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = required_role
  );
$$;

-- Create function to check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role(user_id, 'teacher');
$$;

-- Create function to check if user is student
CREATE OR REPLACE FUNCTION public.is_student(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role(user_id, 'student');
$$;

-- Drop existing policies to recreate them with role checks
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Teachers can view their own courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can create courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can delete their own courses" ON public.courses;
DROP POLICY IF EXISTS "Students can view all courses" ON public.courses;

DROP POLICY IF EXISTS "Teachers can view questions for their own courses" ON public.questions;
DROP POLICY IF EXISTS "Teachers can create questions for their own courses" ON public.questions;
DROP POLICY IF EXISTS "Teachers can update questions for their own courses" ON public.questions;
DROP POLICY IF EXISTS "Teachers can delete questions for their own courses" ON public.questions;
DROP POLICY IF EXISTS "Students can view questions for enrolled courses" ON public.questions;

DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can enroll in courses" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.course_enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments for their courses" ON public.course_enrollments;

DROP POLICY IF EXISTS "Students can view their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can create quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can update their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Teachers can view quiz attempts for their courses" ON public.quiz_attempts;

DROP POLICY IF EXISTS "Students can view their own answers" ON public.student_answers;
DROP POLICY IF EXISTS "Students can submit answers" ON public.student_answers;
DROP POLICY IF EXISTS "Students can update their own answers" ON public.student_answers;

DROP POLICY IF EXISTS "Students can view their own XP" ON public.student_xp;
DROP POLICY IF EXISTS "Students can insert their own XP" ON public.student_xp;
DROP POLICY IF EXISTS "Students can update their own XP" ON public.student_xp;

DROP POLICY IF EXISTS "Students can view their own streaks" ON public.student_streaks;
DROP POLICY IF EXISTS "Students can insert their own streaks" ON public.student_streaks;
DROP POLICY IF EXISTS "Students can update their own streaks" ON public.student_streaks;

DROP POLICY IF EXISTS "Students can view their own coins" ON public.student_coins;
DROP POLICY IF EXISTS "Students can insert their own coins" ON public.student_coins;
DROP POLICY IF EXISTS "Students can update their own coins" ON public.student_coins;

DROP POLICY IF EXISTS "Students can view their own achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Students can insert their own achievements" ON public.student_achievements;

DROP POLICY IF EXISTS "Students can view their own purchases" ON public.student_purchases;
DROP POLICY IF EXISTS "Students can insert their own purchases" ON public.student_purchases;
DROP POLICY IF EXISTS "Students can update their own purchases" ON public.student_purchases;

DROP POLICY IF EXISTS "Students can view their own badge purchases" ON public.student_badge_purchases;
DROP POLICY IF EXISTS "Students can insert their own badge purchases" ON public.student_badge_purchases;
DROP POLICY IF EXISTS "Students can update their own badge purchases" ON public.student_badge_purchases;

DROP POLICY IF EXISTS "Students can view their own farm purchases" ON public.student_farm_purchases;
DROP POLICY IF EXISTS "Students can insert their own farm purchases" ON public.student_farm_purchases;
DROP POLICY IF EXISTS "Students can update their own farm purchases" ON public.student_farm_purchases;

-- Profiles policies with role validation
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Courses policies with role validation
CREATE POLICY "Teachers can view their own courses"
ON public.courses FOR SELECT
USING (public.is_teacher(auth.uid()) AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can create courses"
ON public.courses FOR INSERT
WITH CHECK (public.is_teacher(auth.uid()) AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own courses"
ON public.courses FOR UPDATE
USING (public.is_teacher(auth.uid()) AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own courses"
ON public.courses FOR DELETE
USING (public.is_teacher(auth.uid()) AND auth.uid() = teacher_id);

CREATE POLICY "Students can view all courses"
ON public.courses FOR SELECT
USING (public.is_student(auth.uid()));

-- Questions policies with role validation
CREATE POLICY "Teachers can view questions for their own courses"
ON public.questions FOR SELECT
USING (public.is_teacher(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = questions.course_id AND courses.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can create questions for their own courses"
ON public.questions FOR INSERT
WITH CHECK (public.is_teacher(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = questions.course_id AND courses.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can update questions for their own courses"
ON public.questions FOR UPDATE
USING (public.is_teacher(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = questions.course_id AND courses.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can delete questions for their own courses"
ON public.questions FOR DELETE
USING (public.is_teacher(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = questions.course_id AND courses.teacher_id = auth.uid()
));

CREATE POLICY "Students can view questions for enrolled courses"
ON public.questions FOR SELECT
USING (public.is_student(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.course_enrollments 
  WHERE course_enrollments.course_id = questions.course_id 
  AND course_enrollments.student_id = auth.uid()
));

-- Course enrollments policies with role validation
CREATE POLICY "Students can view their own enrollments"
ON public.course_enrollments FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can enroll in courses"
ON public.course_enrollments FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own progress"
ON public.course_enrollments FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Teachers can view enrollments for their courses"
ON public.course_enrollments FOR SELECT
USING (public.is_teacher(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = course_enrollments.course_id AND courses.teacher_id = auth.uid()
));

-- Quiz attempts policies with role validation
CREATE POLICY "Students can view their own quiz attempts"
ON public.quiz_attempts FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can create quiz attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own quiz attempts"
ON public.quiz_attempts FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Teachers can view quiz attempts for their courses"
ON public.quiz_attempts FOR SELECT
USING (public.is_teacher(auth.uid()) AND EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = quiz_attempts.course_id AND courses.teacher_id = auth.uid()
));

-- Student answers policies (students only)
CREATE POLICY "Students can view their own answers"
ON public.student_answers FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can submit answers"
ON public.student_answers FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own answers"
ON public.student_answers FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

-- Student XP policies (students only)
CREATE POLICY "Students can view their own XP"
ON public.student_xp FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own XP"
ON public.student_xp FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own XP"
ON public.student_xp FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

-- Student streaks policies (students only)
CREATE POLICY "Students can view their own streaks"
ON public.student_streaks FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own streaks"
ON public.student_streaks FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own streaks"
ON public.student_streaks FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

-- Student coins policies (students only)
CREATE POLICY "Students can view their own coins"
ON public.student_coins FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own coins"
ON public.student_coins FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own coins"
ON public.student_coins FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

-- Student achievements policies (students only)
CREATE POLICY "Students can view their own achievements"
ON public.student_achievements FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own achievements"
ON public.student_achievements FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

-- Student purchases policies (students only)
CREATE POLICY "Students can view their own purchases"
ON public.student_purchases FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own purchases"
ON public.student_purchases FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own purchases"
ON public.student_purchases FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

-- Student badge purchases policies (students only)
CREATE POLICY "Students can view their own badge purchases"
ON public.student_badge_purchases FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own badge purchases"
ON public.student_badge_purchases FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own badge purchases"
ON public.student_badge_purchases FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

-- Student farm purchases policies (students only)
CREATE POLICY "Students can view their own farm purchases"
ON public.student_farm_purchases FOR SELECT
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own farm purchases"
ON public.student_farm_purchases FOR INSERT
WITH CHECK (public.is_student(auth.uid()) AND auth.uid() = student_id);

CREATE POLICY "Students can update their own farm purchases"
ON public.student_farm_purchases FOR UPDATE
USING (public.is_student(auth.uid()) AND auth.uid() = student_id);