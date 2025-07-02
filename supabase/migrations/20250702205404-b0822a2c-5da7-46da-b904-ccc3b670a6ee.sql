-- Update avatar items with circular rings to match avatar form
UPDATE public.avatar_items SET 
  css_class = CASE name
    WHEN 'Classic Blue Frame' THEN 'ring-8 ring-blue-500 rounded-full'
    WHEN 'Royal Purple Frame' THEN 'ring-8 ring-purple-500 rounded-full'
    WHEN 'Golden Frame' THEN 'ring-8 ring-yellow-500 rounded-full'
    WHEN 'Emerald Frame' THEN 'ring-8 ring-green-500 rounded-full'
    WHEN 'Ruby Frame' THEN 'ring-8 ring-red-500 rounded-full'
    WHEN 'Silver Frame' THEN 'ring-8 ring-gray-300 rounded-full'
    ELSE css_class
  END;