-- Change tractor back to 1x1 size
UPDATE farm_items 
SET width = 1, height = 1 
WHERE name = 'Tractor';