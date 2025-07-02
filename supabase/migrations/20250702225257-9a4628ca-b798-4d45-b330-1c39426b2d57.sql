-- Update grid positions to account for 4x smaller grid (multiply all positions by 4)
-- House at (0,0) becomes (0,0) but with 8x8 size instead of 2x2
UPDATE public.farm_items SET grid_x = 0, grid_y = 0, width = 8, height = 8 WHERE name = 'Small House';

-- Tractor at (0,1) becomes (0,4) with 4x4 size
UPDATE public.farm_items SET grid_x = 0, grid_y = 4, width = 4, height = 4 WHERE name = 'Tractor';

-- Silo at (0,2) becomes (0,8) with 4x4 size  
UPDATE public.farm_items SET grid_x = 0, grid_y = 8, width = 4, height = 4 WHERE name = 'Silo';

-- Update animal positions to spread them across the new grid
UPDATE public.farm_items SET grid_x = 4, grid_y = 0, width = 4, height = 4 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET grid_x = 12, grid_y = 0, width = 4, height = 4 WHERE name = 'Cow';
UPDATE public.farm_items SET grid_x = 8, grid_y = 4, width = 4, height = 4 WHERE name = 'Sheep';
UPDATE public.farm_items SET grid_x = 16, grid_y = 4, width = 4, height = 4 WHERE name = 'Horse';
UPDATE public.farm_items SET grid_x = 12, grid_y = 8, width = 4, height = 4 WHERE name = 'Pig';