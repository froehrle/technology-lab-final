-- Remove barn and replace with silo
UPDATE public.farm_items 
SET name = 'Silo', 
    description = 'Ein großer Silo zur Lagerung von Getreide',
    icon = '🗼',
    type = 'building'
WHERE name = 'Barn';