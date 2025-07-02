-- Update avatar items with standard Tailwind ring colors for visibility
UPDATE public.avatar_items SET 
  css_class = CASE name
    WHEN 'Classic Blue Frame' THEN 'ring-4 ring-blue-500 rounded-full'
    WHEN 'Royal Purple Frame' THEN 'ring-4 ring-purple-500 rounded-full'
    WHEN 'Golden Frame' THEN 'ring-4 ring-yellow-400 rounded-full'
    WHEN 'Emerald Frame' THEN 'ring-4 ring-green-500 rounded-full'
    WHEN 'Ruby Frame' THEN 'ring-4 ring-red-500 rounded-full'
    WHEN 'Silver Frame' THEN 'ring-4 ring-gray-400 rounded-full'
    ELSE css_class
  END;