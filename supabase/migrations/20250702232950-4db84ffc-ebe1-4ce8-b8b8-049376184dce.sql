-- Move animals to the bottom rows of the farm grid, away from buildings
-- Current grid is 8x6 (rows 0-5), moving animals from row 1 to rows 4-5

-- Row 4: Main animals
UPDATE public.farm_items SET grid_x = 1, grid_y = 4 WHERE name = 'Cow';
UPDATE public.farm_items SET grid_x = 2, grid_y = 4 WHERE name = 'Sheep';
UPDATE public.farm_items SET grid_x = 3, grid_y = 4 WHERE name = 'Horse';
UPDATE public.farm_items SET grid_x = 4, grid_y = 4 WHERE name = 'Pig';

-- Row 5: Chicken Coop (bottom row)
UPDATE public.farm_items SET grid_x = 1, grid_y = 5 WHERE name = 'Chicken Coop';