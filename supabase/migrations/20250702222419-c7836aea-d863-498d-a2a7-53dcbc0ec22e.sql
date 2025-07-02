-- First, let's update the chicken icon to show a full chicken
UPDATE farm_items 
SET icon = '🐓' 
WHERE name ILIKE '%chicken%' OR name ILIKE '%hahn%' OR icon = '🐔';

-- Add new columns to support multi-cell items
ALTER TABLE farm_items 
ADD COLUMN width INTEGER DEFAULT 1,
ADD COLUMN height INTEGER DEFAULT 1;

-- Update existing structures to span multiple cells
-- House/Barn - make it 2x2
UPDATE farm_items 
SET width = 2, height = 2 
WHERE type = 'building' AND (name ILIKE '%house%' OR name ILIKE '%barn%' OR name ILIKE '%haus%' OR name ILIKE '%scheune%');

-- Larger equipment like tractors - make them 2x1
UPDATE farm_items 
SET width = 2, height = 1 
WHERE type = 'equipment' AND (name ILIKE '%traktor%' OR name ILIKE '%tractor%');

-- Add comments
COMMENT ON COLUMN farm_items.width IS 'Number of grid cells wide this item spans';
COMMENT ON COLUMN farm_items.height IS 'Number of grid cells tall this item spans';