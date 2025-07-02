-- Add purchase_order column and remove custom position columns
ALTER TABLE public.farm_items 
ADD COLUMN purchase_order INTEGER;

-- Remove custom position columns from student_farm_purchases (no longer needed for fixed positions)
ALTER TABLE public.student_farm_purchases 
DROP COLUMN custom_grid_x,
DROP COLUMN custom_grid_y;

-- Update farm items with logical purchase order (1-12) and reorganize grid for better 5x3 layout
-- Front row (crops) - y=2
UPDATE public.farm_items SET purchase_order = 1, grid_x = 0, grid_y = 2 WHERE name = 'Wheat Field';
UPDATE public.farm_items SET purchase_order = 5, grid_x = 1, grid_y = 2 WHERE name = 'Corn Field';
UPDATE public.farm_items SET purchase_order = 10, grid_x = 2, grid_y = 2 WHERE name = 'Sunflower Field';

-- Middle row (animals and equipment) - y=1
UPDATE public.farm_items SET purchase_order = 2, grid_x = 0, grid_y = 1 WHERE name = 'Well';
UPDATE public.farm_items SET purchase_order = 3, grid_x = 1, grid_y = 1 WHERE name = 'Chicken Coop';
UPDATE public.farm_items SET purchase_order = 6, grid_x = 2, grid_y = 1 WHERE name = 'Cow';
UPDATE public.farm_items SET purchase_order = 8, grid_x = 3, grid_y = 1 WHERE name = 'Sheep';
UPDATE public.farm_items SET purchase_order = 9, grid_x = 4, grid_y = 1 WHERE name = 'Tractor';

-- Back row (buildings and infrastructure) - y=0
UPDATE public.farm_items SET purchase_order = 4, grid_x = 0, grid_y = 0, width = 2, height = 1 WHERE name = 'Small House';
UPDATE public.farm_items SET purchase_order = 7, grid_x = 2, grid_y = 0, width = 2, height = 1 WHERE name = 'Barn';
UPDATE public.farm_items SET purchase_order = 11, grid_x = 4, grid_y = 0 WHERE name = 'Windmill';
UPDATE public.farm_items SET purchase_order = 12, grid_x = 3, grid_y = 2 WHERE name = 'Silo';

-- Add index for purchase_order for better query performance
CREATE INDEX idx_farm_items_purchase_order ON public.farm_items(purchase_order);

-- Add comments
COMMENT ON COLUMN farm_items.purchase_order IS 'Fixed order in which items must be purchased (1-12)';