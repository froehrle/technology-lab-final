-- Make the farmhouse bigger - 2x2 (4 total grids)
-- Change Small House to be 2x2 starting at position (0,0)
UPDATE public.farm_items 
SET width = 2, height = 2, name = 'Farmhouse'
WHERE name = 'Small House';

-- Move other items to accommodate the larger farmhouse
-- Move Barn to make room for the 2x2 farmhouse
UPDATE public.farm_items SET grid_x = 2, grid_y = 0 WHERE name = 'Barn';
UPDATE public.farm_items SET grid_x = 3, grid_y = 0 WHERE name = 'Silo';
UPDATE public.farm_items SET grid_x = 4, grid_y = 0 WHERE name = 'Windmill';
UPDATE public.farm_items SET grid_x = 5, grid_y = 0 WHERE name = 'Well';