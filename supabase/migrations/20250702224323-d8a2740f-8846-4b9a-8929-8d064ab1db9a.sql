-- Update barn icon to actual barn
UPDATE public.farm_items SET icon = '🚩' WHERE name = 'Barn';

-- Reorganize farm layout: House bottom left, Barn beside it, Tractor beside barn, animals scattered
-- Bottom row (y=2): House, Barn, Tractor
UPDATE public.farm_items SET grid_x = 0, grid_y = 2 WHERE name = 'Small House';
UPDATE public.farm_items SET grid_x = 2, grid_y = 2 WHERE name = 'Barn';
UPDATE public.farm_items SET grid_x = 4, grid_y = 2 WHERE name = 'Tractor';

-- Scatter animals evenly across remaining positions
UPDATE public.farm_items SET grid_x = 1, grid_y = 0 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET grid_x = 3, grid_y = 0 WHERE name = 'Cow';
UPDATE public.farm_items SET grid_x = 0, grid_y = 1 WHERE name = 'Sheep';
UPDATE public.farm_items SET grid_x = 2, grid_y = 1 WHERE name = 'Horse';
UPDATE public.farm_items SET grid_x = 4, grid_y = 1 WHERE name = 'Pig';