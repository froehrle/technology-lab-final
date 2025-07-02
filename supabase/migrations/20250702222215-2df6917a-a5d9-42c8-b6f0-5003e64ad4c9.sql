-- Add position columns to student_farm_purchases to track user's custom positioning
ALTER TABLE public.student_farm_purchases 
ADD COLUMN custom_grid_x INTEGER,
ADD COLUMN custom_grid_y INTEGER;

-- Add comments to clarify the purpose
COMMENT ON COLUMN public.student_farm_purchases.custom_grid_x IS 'User''s custom X position for this farm item (overrides default from farm_items)';
COMMENT ON COLUMN public.student_farm_purchases.custom_grid_y IS 'User''s custom Y position for this farm item (overrides default from farm_items)';