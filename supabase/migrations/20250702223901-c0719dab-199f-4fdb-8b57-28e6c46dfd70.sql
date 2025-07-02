-- Update pig and horse icons to show full animals
UPDATE public.farm_items SET icon = '🐎' WHERE name = 'Horse';
UPDATE public.farm_items SET icon = '🐖' WHERE name = 'Pig';