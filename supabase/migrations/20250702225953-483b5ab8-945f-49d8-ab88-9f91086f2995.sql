-- Resize farm items to requested proportions and optimize layout
-- House: 16x16 → 3x3 (keep at 0,0)
UPDATE public.farm_items SET width = 3, height = 3 WHERE name = 'Small House';

-- Tractor: 8x8 → 2x1 and move to (4,0)  
UPDATE public.farm_items SET grid_x = 4, grid_y = 0, width = 2, height = 1 WHERE name = 'Tractor';

-- Silo: 8x8 → 1x2 and move to (7,0)
UPDATE public.farm_items SET grid_x = 7, grid_y = 0, width = 1, height = 2 WHERE name = 'Silo';

-- All animals: 4x4 → 1x1 and arrange in a row
UPDATE public.farm_items SET grid_x = 9, grid_y = 0, width = 1, height = 1 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET grid_x = 11, grid_y = 0, width = 1, height = 1 WHERE name = 'Cow';
UPDATE public.farm_items SET grid_x = 13, grid_y = 0, width = 1, height = 1 WHERE name = 'Sheep';
UPDATE public.farm_items SET grid_x = 15, grid_y = 0, width = 1, height = 1 WHERE name = 'Horse';
UPDATE public.farm_items SET grid_x = 17, grid_y = 0, width = 1, height = 1 WHERE name = 'Pig';