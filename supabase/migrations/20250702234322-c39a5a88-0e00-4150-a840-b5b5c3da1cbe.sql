-- Fix farm animal purchase order for natural progression
-- Chickens → Pigs → Sheep → Cows → Horses (easiest to most complex/expensive)

UPDATE public.farm_items 
SET purchase_order = 6
WHERE name = 'Hühnerstall';  -- Chicken Coop stays first (easiest)

UPDATE public.farm_items 
SET purchase_order = 7
WHERE name = 'Schwein';  -- Pig moves to second (medium cost, good return)

UPDATE public.farm_items 
SET purchase_order = 8
WHERE name = 'Schaf';  -- Sheep stays third (wool production)

UPDATE public.farm_items 
SET purchase_order = 9
WHERE name = 'Kuh';  -- Cow moves to fourth (expensive, high value)

UPDATE public.farm_items 
SET purchase_order = 10
WHERE name = 'Pferd';  -- Horse stays last (most expensive, work animal)