-- Reset all farm items to simple 1x1 positioning for fresh start
-- Set up an 8x5 grid with logical positioning

-- Reset all items to 1x1 dimensions first
UPDATE public.farm_items SET width = 1, height = 1;

-- Position items in a simple 8x5 grid layout
-- Row 0: Buildings and structures
UPDATE public.farm_items SET grid_x = 0, grid_y = 0, purchase_order = 1 WHERE name = 'Small House';
UPDATE public.farm_items SET grid_x = 1, grid_y = 0, purchase_order = 2 WHERE name = 'Tractor';
UPDATE public.farm_items SET grid_x = 2, grid_y = 0, purchase_order = 3 WHERE name = 'Silo';
UPDATE public.farm_items SET grid_x = 3, grid_y = 0, purchase_order = 4 WHERE name = 'Windmill';
UPDATE public.farm_items SET grid_x = 4, grid_y = 0, purchase_order = 5 WHERE name = 'Barn';

-- Row 1: Animals
UPDATE public.farm_items SET grid_x = 0, grid_y = 1, purchase_order = 6 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET grid_x = 1, grid_y = 1, purchase_order = 7 WHERE name = 'Cow';
UPDATE public.farm_items SET grid_x = 2, grid_y = 1, purchase_order = 8 WHERE name = 'Sheep';
UPDATE public.farm_items SET grid_x = 3, grid_y = 1, purchase_order = 9 WHERE name = 'Horse';
UPDATE public.farm_items SET grid_x = 4, grid_y = 1, purchase_order = 10 WHERE name = 'Pig';

-- Row 2: Crops and additional items
UPDATE public.farm_items SET grid_x = 0, grid_y = 2, purchase_order = 11 WHERE name = 'Wheat Field';
UPDATE public.farm_items SET grid_x = 1, grid_y = 2, purchase_order = 12 WHERE name = 'Corn Field';
UPDATE public.farm_items SET grid_x = 2, grid_y = 2, purchase_order = 13 WHERE name = 'Sunflower Field';
UPDATE public.farm_items SET grid_x = 3, grid_y = 2, purchase_order = 14 WHERE name = 'Well';

-- Remove any items that might be positioned outside the 8x5 grid
UPDATE public.farm_items SET grid_x = 0, grid_y = 0 WHERE grid_x >= 8 OR grid_y >= 5;