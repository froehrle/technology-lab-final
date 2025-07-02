-- Update farm item positions for smaller 10x6 grid (divide positions by 2)
-- House: (0,0) stays at (0,0) but reduce size to 2x2
UPDATE public.farm_items SET grid_x = 0, grid_y = 0, width = 2, height = 2 WHERE name = 'Small House';

-- Tractor: (4,0) → (2,0) and keep as 1x1  
UPDATE public.farm_items SET grid_x = 2, grid_y = 0, width = 1, height = 1 WHERE name = 'Tractor';

-- Silo: (7,0) → (3,0) and keep as 1x1
UPDATE public.farm_items SET grid_x = 3, grid_y = 0, width = 1, height = 1 WHERE name = 'Silo';

-- Animals: arrange in second row
UPDATE public.farm_items SET grid_x = 0, grid_y = 2, width = 1, height = 1 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET grid_x = 1, grid_y = 2, width = 1, height = 1 WHERE name = 'Cow';
UPDATE public.farm_items SET grid_x = 2, grid_y = 2, width = 1, height = 1 WHERE name = 'Sheep';
UPDATE public.farm_items SET grid_x = 3, grid_y = 2, width = 1, height = 1 WHERE name = 'Horse';
UPDATE public.farm_items SET grid_x = 4, grid_y = 2, width = 1, height = 1 WHERE name = 'Pig';