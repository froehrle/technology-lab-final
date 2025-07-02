-- Update positions: House at (0,0), Tractor at (0,1), Silo at (0,2) 
UPDATE public.farm_items SET grid_x = 0, grid_y = 0 WHERE name = 'Small House';
UPDATE public.farm_items SET grid_x = 0, grid_y = 1 WHERE name = 'Tractor';
UPDATE public.farm_items SET grid_x = 0, grid_y = 2 WHERE name = 'Silo';