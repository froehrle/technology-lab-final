-- Update avatar items with thicker rings using Tailwind classes
UPDATE public.avatar_items SET 
  css_class = CASE name
    WHEN 'Classic Blue Frame' THEN 'ring-8 ring-blue-500'
    WHEN 'Royal Purple Frame' THEN 'ring-8 ring-purple-500'
    WHEN 'Golden Frame' THEN 'ring-8 ring-yellow-500'
    WHEN 'Emerald Frame' THEN 'ring-8 ring-green-500'
    WHEN 'Ruby Frame' THEN 'ring-8 ring-red-500'
    WHEN 'Silver Frame' THEN 'ring-8 ring-gray-300'
    ELSE css_class
  END;