-- Add foreign key constraints that were missing
ALTER TABLE public.student_purchases 
ADD CONSTRAINT student_purchases_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES public.avatar_items(id) ON DELETE CASCADE;

ALTER TABLE public.student_purchases 
ADD CONSTRAINT student_purchases_theme_id_fkey 
FOREIGN KEY (theme_id) REFERENCES public.app_themes(id) ON DELETE CASCADE;

-- Also add constraint to ensure only one of item_id or theme_id is set
ALTER TABLE public.student_purchases 
ADD CONSTRAINT check_purchase_type_consistency 
CHECK (
  (purchase_type = 'avatar_item' AND item_id IS NOT NULL AND theme_id IS NULL) OR
  (purchase_type = 'theme' AND theme_id IS NOT NULL AND item_id IS NULL)
);