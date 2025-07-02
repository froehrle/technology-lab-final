-- Create profile badges table
CREATE TABLE public.profile_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  price INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  badge_type TEXT NOT NULL CHECK (badge_type IN ('title', 'badge')),
  is_purchasable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profile badges
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;

-- Policy for viewing badges
CREATE POLICY "Everyone can view profile badges" 
ON public.profile_badges 
FOR SELECT 
USING (true);

-- Clear existing avatar items and add simple frames
DELETE FROM public.avatar_items;

-- Insert simple avatar frames
INSERT INTO public.avatar_items (id, name, type, css_class, price, description, rarity) VALUES
('frame-blue', 'Classic Blue Frame', 'frame', 'ring-4 ring-blue-500', 50, 'A classic blue border around your avatar', 'common'),
('frame-purple', 'Royal Purple Frame', 'frame', 'ring-4 ring-purple-500', 75, 'A royal purple border for distinguished users', 'rare'),
('frame-gold', 'Golden Frame', 'frame', 'ring-4 ring-yellow-500', 100, 'A prestigious golden frame', 'epic'),
('frame-green', 'Emerald Frame', 'frame', 'ring-4 ring-green-500', 75, 'A vibrant emerald border', 'rare'),
('frame-red', 'Ruby Frame', 'frame', 'ring-4 ring-red-500', 75, 'A bold ruby red frame', 'rare'),
('frame-white', 'Silver Frame', 'frame', 'ring-4 ring-white', 60, 'A clean silver border', 'common');

-- Insert profile badges and titles
INSERT INTO public.profile_badges (id, name, description, icon, price, rarity, badge_type, is_purchasable) VALUES
-- Achievement badges (not purchasable, earned through gameplay)
('badge-quiz-master', 'Quiz Master', 'Complete 10 quizzes with perfect scores', '🏆', 0, 'legendary', 'badge', false),
('badge-speed-demon', 'Speed Demon', 'Complete 5 quizzes in under 2 minutes each', '⚡', 0, 'epic', 'badge', false),
('badge-scholar', 'Scholar', 'Complete 3 different courses', '📚', 0, 'rare', 'badge', false),
('badge-dedicated', 'Dedicated Learner', 'Log in 7 consecutive days', '📅', 0, 'rare', 'badge', false),

-- Purchasable titles
('title-wise', 'The Wise', 'Show wisdom in your learning journey', '🧠', 200, 'rare', 'title', true),
('title-champion', 'Champion', 'Display your champion status', '👑', 300, 'epic', 'title', true),
('title-prodigy', 'Prodigy', 'Showcase your exceptional abilities', '⭐', 250, 'rare', 'title', true),
('title-mastermind', 'Mastermind', 'The ultimate title for true masters', '💎', 400, 'legendary', 'title', true);

-- Create student_badge_purchases table to track badge ownership
CREATE TABLE public.student_badge_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.profile_badges(id),
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, badge_id)
);

-- Enable RLS on student badge purchases
ALTER TABLE public.student_badge_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for badge purchases
CREATE POLICY "Students can view their own badge purchases" 
ON public.student_badge_purchases 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own badge purchases" 
ON public.student_badge_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own badge purchases" 
ON public.student_badge_purchases 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Update avatar_items to use 'frame' type instead of mixed types
UPDATE public.avatar_items SET type = 'frame' WHERE type IN ('border', 'background', 'effect');