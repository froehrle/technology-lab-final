-- Remove unwanted farm items (keep only House, Barn, Tractor, Sheep, Chicken, Cow)
DELETE FROM public.student_farm_purchases 
WHERE farm_item_id IN (
  SELECT id FROM public.farm_items 
  WHERE name NOT IN ('Small House', 'Barn', 'Tractor', 'Sheep', 'Chicken Coop', 'Cow')
);

DELETE FROM public.farm_items 
WHERE name NOT IN ('Small House', 'Barn', 'Tractor', 'Sheep', 'Chicken Coop', 'Cow');

-- Add Horse and Pig
INSERT INTO public.farm_items (name, description, type, price, grid_x, grid_y, icon, rarity, purchase_order, width, height) VALUES
('Horse', 'Ein elegantes Pferd für die Farmarbeit', 'animal', 800, 3, 1, '🐴', 'uncommon', 7, 1, 1),
('Pig', 'Ein fröhliches Schwein', 'animal', 300, 4, 1, '🐷', 'common', 8, 1, 1);

-- Update purchase order for remaining items to create logical sequence
UPDATE public.farm_items SET purchase_order = 1 WHERE name = 'Small House';
UPDATE public.farm_items SET purchase_order = 2 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET purchase_order = 3 WHERE name = 'Cow';
UPDATE public.farm_items SET purchase_order = 4 WHERE name = 'Sheep';
UPDATE public.farm_items SET purchase_order = 5 WHERE name = 'Barn';
UPDATE public.farm_items SET purchase_order = 6 WHERE name = 'Tractor';

-- Update grid positions for cleaner 3x3 layout
UPDATE public.farm_items SET grid_x = 0, grid_y = 0 WHERE name = 'Small House';
UPDATE public.farm_items SET grid_x = 2, grid_y = 0 WHERE name = 'Barn';
UPDATE public.farm_items SET grid_x = 0, grid_y = 1 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET grid_x = 1, grid_y = 1 WHERE name = 'Cow';
UPDATE public.farm_items SET grid_x = 2, grid_y = 1 WHERE name = 'Sheep';
UPDATE public.farm_items SET grid_x = 3, grid_y = 1 WHERE name = 'Horse';
UPDATE public.farm_items SET grid_x = 4, grid_y = 1 WHERE name = 'Pig';
UPDATE public.farm_items SET grid_x = 1, grid_y = 2 WHERE name = 'Tractor';