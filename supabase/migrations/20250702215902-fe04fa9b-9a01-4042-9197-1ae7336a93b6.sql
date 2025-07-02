-- Create farm_items table
CREATE TABLE public.farm_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'building', 'animal', 'equipment', 'crop'
  price INTEGER NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  prerequisite_item_id UUID, -- Optional prerequisite item
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_farm_purchases table
CREATE TABLE public.student_farm_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  farm_item_id UUID NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_placed BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.farm_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_farm_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for farm_items
CREATE POLICY "Everyone can view farm items" 
ON public.farm_items 
FOR SELECT 
USING (true);

-- Create policies for student_farm_purchases
CREATE POLICY "Students can view their own farm purchases" 
ON public.student_farm_purchases 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own farm purchases" 
ON public.student_farm_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own farm purchases" 
ON public.student_farm_purchases 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Add foreign key constraint
ALTER TABLE public.student_farm_purchases 
ADD CONSTRAINT student_farm_purchases_farm_item_id_fkey 
FOREIGN KEY (farm_item_id) REFERENCES public.farm_items(id);

-- Insert sample farm items with grid positions
INSERT INTO public.farm_items (name, description, type, price, grid_x, grid_y, icon, rarity) VALUES
-- Buildings (back row for depth)
('Small House', 'Ein gemütliches kleines Haus für den Farmer', 'building', 500, 1, 0, '🏠', 'common'),
('Barn', 'Eine große Scheune für Tiere und Ausrüstung', 'building', 800, 3, 0, '🏚️', 'uncommon'),
('Silo', 'Speichert Getreide und Futter', 'building', 600, 5, 0, '🗼', 'uncommon'),

-- Equipment (middle area)
('Tractor', 'Ein zuverlässiger Traktor für die Feldarbeit', 'equipment', 1200, 0, 1, '🚜', 'rare'),
('Well', 'Frisches Wasser für die Farm', 'equipment', 300, 2, 1, '🪣', 'common'),
('Windmill', 'Erzeugt Energie für die Farm', 'equipment', 1000, 4, 1, '🏗️', 'rare'),

-- Animals (front area)
('Cow', 'Eine freundliche Milchkuh', 'animal', 400, 1, 2, '🐄', 'common'),
('Sheep', 'Flauschige Schafe für Wolle', 'animal', 250, 3, 2, '🐑', 'common'),
('Chicken Coop', 'Ein Hühnerstall mit glücklichen Hühnern', 'animal', 200, 5, 2, '🐔', 'common'),

-- Crops (front row)
('Wheat Field', 'Goldenes Weizenfeld', 'crop', 150, 0, 3, '🌾', 'common'),
('Corn Field', 'Hohes grünes Maisfeld', 'crop', 180, 2, 3, '🌽', 'common'),
('Sunflower Field', 'Sonnige Sonnenblumen', 'crop', 220, 4, 3, '🌻', 'uncommon');

-- Add some prerequisites (barn requires house first)
UPDATE public.farm_items 
SET prerequisite_item_id = (SELECT id FROM public.farm_items WHERE name = 'Small House') 
WHERE name = 'Barn';