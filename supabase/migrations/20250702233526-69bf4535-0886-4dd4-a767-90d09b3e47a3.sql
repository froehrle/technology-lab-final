-- Fix farm item order, German descriptions, and animal spacing
-- Update all descriptions to German and reorder items logically

-- Buildings (purchase order 1-5)
UPDATE public.farm_items 
SET name = 'Bauernhaus', description = 'Ein gemütliches Zuhause für die Bauernfamilie', purchase_order = 1
WHERE name = 'Farmhouse' OR name = 'Small House';

UPDATE public.farm_items 
SET name = 'Scheune', description = 'Lagert Heu und Getreide für die Tiere', purchase_order = 2
WHERE name = 'Barn';

UPDATE public.farm_items 
SET name = 'Brunnen', description = 'Frisches Wasser für alle Tiere und Pflanzen', purchase_order = 3
WHERE name = 'Well';

UPDATE public.farm_items 
SET name = 'Silo', description = 'Speichert große Mengen Getreide', purchase_order = 4
WHERE name = 'Silo';

UPDATE public.farm_items 
SET name = 'Windmühle', description = 'Mahlt Getreide zu Mehl', purchase_order = 5
WHERE name = 'Windmill';

-- Animals (purchase order 6-10) with 1 grid spacing
UPDATE public.farm_items 
SET name = 'Hühnerstall', description = 'Ein gemütlicher Stall für Hühner, die täglich Eier legen', 
    grid_x = 0, grid_y = 4, purchase_order = 6
WHERE name = 'Chicken Coop';

UPDATE public.farm_items 
SET name = 'Kuh', description = 'Eine freundliche Milchkuh, die täglich frische Milch gibt', 
    grid_x = 2, grid_y = 4, purchase_order = 7
WHERE name = 'Cow';

UPDATE public.farm_items 
SET name = 'Schaf', description = 'Ein flauschiges Schaf, das warme Wolle produziert', 
    grid_x = 4, grid_y = 4, purchase_order = 8
WHERE name = 'Sheep';

UPDATE public.farm_items 
SET name = 'Pferd', description = 'Ein starkes Arbeitspferd für schwere Feldarbeit', 
    grid_x = 6, grid_y = 4, purchase_order = 9
WHERE name = 'Horse';

UPDATE public.farm_items 
SET name = 'Schwein', description = 'Ein glückliches Schwein, das im Schlamm spielt', 
    grid_x = 0, grid_y = 5, purchase_order = 10
WHERE name = 'Pig';

-- Equipment (purchase order 11)
UPDATE public.farm_items 
SET name = 'Traktor', description = 'Ein robuster Traktor für die Feldarbeit', 
    grid_x = 2, grid_y = 5, purchase_order = 11
WHERE name = 'Tractor';

-- Crops (purchase order 12-14)
UPDATE public.farm_items 
SET name = 'Weizenfeld', description = 'Ein goldenes Feld voller reifem Weizen', 
    grid_x = 0, grid_y = 3, purchase_order = 12
WHERE name = 'Wheat Field';

UPDATE public.farm_items 
SET name = 'Maisfeld', description = 'Hohe Maispflanzen, die im Wind schwanken', 
    grid_x = 2, grid_y = 3, purchase_order = 13
WHERE name = 'Corn Field';

UPDATE public.farm_items 
SET name = 'Sonnenblumenfeld', description = 'Strahlende Sonnenblumen, die der Sonne folgen', 
    grid_x = 4, grid_y = 3, purchase_order = 14
WHERE name = 'Sunflower Field';

-- Update types to German
UPDATE public.farm_items SET type = 'Gebäude' WHERE type = 'building';
UPDATE public.farm_items SET type = 'Tier' WHERE type = 'animal';
UPDATE public.farm_items SET type = 'Ausrüstung' WHERE type = 'equipment';
UPDATE public.farm_items SET type = 'Feld' WHERE type = 'crop';