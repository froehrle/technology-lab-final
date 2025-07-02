-- Update avatar items with distinct custom colors
UPDATE public.avatar_items SET 
  css_class = CASE name
    WHEN 'Classic Blue Frame' THEN 'ring-8 ring-frame-blue rounded-full'
    WHEN 'Royal Purple Frame' THEN 'ring-8 ring-frame-purple rounded-full'
    WHEN 'Golden Frame' THEN 'ring-8 ring-frame-gold rounded-full'
    WHEN 'Emerald Frame' THEN 'ring-8 ring-frame-green rounded-full'
    WHEN 'Ruby Frame' THEN 'ring-8 ring-frame-red rounded-full'
    WHEN 'Silver Frame' THEN 'ring-8 ring-frame-silver rounded-full'
    ELSE css_class
  END;