-- Create student coins table
CREATE TABLE public.student_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  total_coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create avatar items table
CREATE TABLE public.avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'border', 'background', 'effect'
  css_class TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app themes table
CREATE TABLE public.app_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  css_variables JSONB NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  preview_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student purchases table
CREATE TABLE public.student_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  item_id UUID,
  theme_id UUID,
  purchase_type TEXT NOT NULL, -- 'avatar_item' or 'theme'
  is_equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_coins
CREATE POLICY "Students can view their own coins" 
ON public.student_coins 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own coins" 
ON public.student_coins 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own coins" 
ON public.student_coins 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- RLS Policies for avatar_items (everyone can view items)
CREATE POLICY "Everyone can view avatar items" 
ON public.avatar_items 
FOR SELECT 
USING (true);

-- RLS Policies for app_themes (everyone can view themes)
CREATE POLICY "Everyone can view app themes" 
ON public.app_themes 
FOR SELECT 
USING (true);

-- RLS Policies for student_purchases
CREATE POLICY "Students can view their own purchases" 
ON public.student_purchases 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own purchases" 
ON public.student_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own purchases" 
ON public.student_purchases 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Create unique constraint for student_id in coins table
ALTER TABLE public.student_coins ADD CONSTRAINT student_coins_student_id_unique UNIQUE (student_id);

-- Create indexes for better performance
CREATE INDEX idx_student_purchases_student_id ON public.student_purchases(student_id);
CREATE INDEX idx_student_purchases_item_id ON public.student_purchases(item_id);
CREATE INDEX idx_student_purchases_theme_id ON public.student_purchases(theme_id);

-- Insert default avatar items
INSERT INTO public.avatar_items (name, type, css_class, price, description, rarity) VALUES
('Crown Border', 'border', 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-yellow-100', 50, 'Golden crown border for true achievers', 'epic'),
('Fire Border', 'border', 'ring-4 ring-red-500 ring-offset-2 ring-offset-red-100 animate-pulse', 40, 'Blazing fire border with animation', 'rare'),
('Ice Border', 'border', 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-cyan-100', 30, 'Cool ice crystal border', 'rare'),
('Rainbow Border', 'border', 'ring-4 ring-gradient-rainbow ring-offset-2', 75, 'Magical rainbow border', 'legendary'),
('Lightning Border', 'border', 'ring-4 ring-yellow-300 ring-offset-2 animate-ping', 60, 'Electric lightning effect', 'epic'),

('Bronze Background', 'background', 'bg-gradient-to-r from-amber-600 to-amber-400', 15, 'Bronze gradient background', 'common'),
('Silver Background', 'background', 'bg-gradient-to-r from-gray-400 to-gray-300', 25, 'Silver gradient background', 'common'),
('Gold Background', 'background', 'bg-gradient-to-r from-yellow-500 to-yellow-300', 35, 'Gold gradient background', 'rare'),
('Rainbow Background', 'background', 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500', 50, 'Rainbow gradient background', 'epic'),
('Galaxy Background', 'background', 'bg-gradient-to-r from-indigo-900 via-purple-500 to-pink-500', 60, 'Cosmic galaxy background', 'epic'),

('Glow Effect', 'effect', 'shadow-lg shadow-yellow-300/50', 20, 'Bright glow around your avatar', 'common'),
('Sparkle Effect', 'effect', 'animate-bounce', 30, 'Bouncing sparkle animation', 'rare'),
('Pulse Effect', 'effect', 'animate-pulse', 25, 'Gentle pulsing animation', 'common'),
('Floating Effect', 'effect', 'hover:animate-bounce transition-all', 40, 'Floating hover effect', 'rare');

-- Insert default app themes
INSERT INTO public.app_themes (name, css_variables, price, description) VALUES
('Dark Academia', '{"primary": "25 25 25", "background": "245 245 244", "foreground": "23 23 23"}', 150, 'Elegant dark academia theme with rich browns and golds'),
('Ocean Breeze', '{"primary": "59 130 246", "background": "239 246 255", "foreground": "30 58 138"}', 120, 'Refreshing ocean blues and teals'),
('Sunset Vibes', '{"primary": "251 146 60", "background": "255 251 235", "foreground": "154 52 18"}', 140, 'Warm sunset oranges and purples'),
('Midnight Mode', '{"primary": "139 92 246", "background": "15 23 42", "foreground": "248 250 252"}', 180, 'Deep midnight blues and purples'),
('Forest Theme', '{"primary": "34 197 94", "background": "240 253 244", "foreground": "20 83 45"}', 130, 'Natural greens and earth tones');

-- Create function to award coins for XP milestones
CREATE OR REPLACE FUNCTION public.award_coins_for_xp()
RETURNS TRIGGER AS $$
DECLARE
    new_total_xp INTEGER;
    old_total_xp INTEGER;
    coins_to_award INTEGER;
    milestone_coins INTEGER := 50; -- Coins per 500 XP milestone
    milestone_interval INTEGER := 500;
BEGIN
    new_total_xp := NEW.total_xp;
    old_total_xp := COALESCE(OLD.total_xp, 0);
    
    -- Calculate how many milestones were crossed
    coins_to_award := ((new_total_xp / milestone_interval) - (old_total_xp / milestone_interval)) * milestone_coins;
    
    -- Award coins if any milestones were crossed
    IF coins_to_award > 0 THEN
        INSERT INTO public.student_coins (student_id, total_coins)
        VALUES (NEW.student_id, coins_to_award)
        ON CONFLICT (student_id)
        DO UPDATE SET 
            total_coins = student_coins.total_coins + coins_to_award,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for XP milestone coins
CREATE TRIGGER award_coins_for_xp_trigger
    AFTER INSERT OR UPDATE ON public.student_xp
    FOR EACH ROW
    EXECUTE FUNCTION public.award_coins_for_xp();

-- Create function to award coins for correct answers
CREATE OR REPLACE FUNCTION public.award_coins_for_answers()
RETURNS TRIGGER AS $$
BEGIN
    -- Award 5 coins for first-try correct answers
    IF NEW.is_correct = true AND NEW.attempt_count = 1 THEN
        INSERT INTO public.student_coins (student_id, total_coins)
        VALUES (NEW.student_id, 5)
        ON CONFLICT (student_id)
        DO UPDATE SET 
            total_coins = student_coins.total_coins + 5,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer coins
CREATE TRIGGER award_coins_for_answers_trigger
    AFTER INSERT ON public.student_answers
    FOR EACH ROW
    EXECUTE FUNCTION public.award_coins_for_answers();