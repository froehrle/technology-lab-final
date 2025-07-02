-- Fix farm items to have complete order 1-8
-- Buildings → Animals → Equipment (logical progression)

UPDATE public.farm_items 
SET purchase_order = 1
WHERE name = 'Bauernhaus';  -- Farmhouse

UPDATE public.farm_items 
SET purchase_order = 2
WHERE name = 'Silo';  -- Silo

UPDATE public.farm_items 
SET purchase_order = 3
WHERE name = 'Hühnerstall';  -- Chicken Coop

UPDATE public.farm_items 
SET purchase_order = 4
WHERE name = 'Schwein';  -- Pig

UPDATE public.farm_items 
SET purchase_order = 5
WHERE name = 'Schaf';  -- Sheep

UPDATE public.farm_items 
SET purchase_order = 6
WHERE name = 'Kuh';  -- Cow

UPDATE public.farm_items 
SET purchase_order = 7
WHERE name = 'Pferd';  -- Horse

UPDATE public.farm_items 
SET purchase_order = 8
WHERE name = 'Traktor';  -- Tractor