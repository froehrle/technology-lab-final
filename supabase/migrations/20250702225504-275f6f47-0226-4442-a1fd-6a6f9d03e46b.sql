-- Move house to top left corner and double all building sizes
-- House: move to (0,0) and make it 16x16 (double from 8x8)
UPDATE public.farm_items SET grid_x = 0, grid_y = 0, width = 16, height = 16 WHERE name = 'Small House';

-- Tractor: make it 8x8 (double from 4x4) and move to avoid house
UPDATE public.farm_items SET grid_x = 0, grid_y = 16, width = 8, height = 8 WHERE name = 'Tractor';

-- Silo: make it 8x8 (double from 4x4) and position next to tractor
UPDATE public.farm_items SET grid_x = 8, grid_y = 16, width = 8, height = 8 WHERE name = 'Silo';