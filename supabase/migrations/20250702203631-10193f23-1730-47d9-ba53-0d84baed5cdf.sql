-- Update avatar items with simplified, working CSS classes

-- Update background items with simple, reliable classes
UPDATE public.avatar_items SET css_class = 'bg-blue-100' WHERE id = '330f7b7a-8787-4835-b741-978ad96e0597'; -- Bronze Background
UPDATE public.avatar_items SET css_class = 'bg-gray-100' WHERE id = 'e380d9d9-50e3-45d1-aa92-2353d029046b'; -- Silver Background  
UPDATE public.avatar_items SET css_class = 'bg-yellow-100' WHERE id = '43b45277-f14b-4be0-8c04-a733e62dd186'; -- Gold Background
UPDATE public.avatar_items SET css_class = 'bg-gradient-to-br from-purple-200 to-pink-200' WHERE id = 'f2301664-4b0e-45ca-9d43-20256be56234'; -- Rainbow Background
UPDATE public.avatar_items SET css_class = 'bg-gradient-to-br from-indigo-200 to-purple-200' WHERE id = '43a85085-1393-4e41-96af-f50c41ff8559'; -- Galaxy Background

-- Update border items with simple ring classes
UPDATE public.avatar_items SET css_class = 'ring-2 ring-cyan-400' WHERE id = 'a7d1c5e5-9989-4d18-a32c-0c8bc82c8d15'; -- Ice Border
UPDATE public.avatar_items SET css_class = 'ring-2 ring-red-400' WHERE id = 'e4a54b70-de94-47dd-92e1-2921985901ad'; -- Fire Border
UPDATE public.avatar_items SET css_class = 'ring-4 ring-yellow-400' WHERE id = 'd1744aa6-2908-4657-9e9c-42223eb1204b'; -- Crown Border
UPDATE public.avatar_items SET css_class = 'ring-4 ring-blue-400' WHERE id = 'a14b1730-3a02-48bc-bd55-7489361a3f42'; -- Lightning Border
UPDATE public.avatar_items SET css_class = 'ring-4 ring-purple-500' WHERE id = 'e2539f0a-ba05-4776-a4c1-36dc5053c310'; -- Rainbow Border

-- Update effect items with simple shadow/animation classes
UPDATE public.avatar_items SET css_class = 'shadow-lg shadow-yellow-200/50' WHERE id = 'd1b2de6f-59dc-4222-babd-aa9f818fb71d'; -- Glow Effect
UPDATE public.avatar_items SET css_class = 'animate-pulse' WHERE id = 'b1c22b94-d200-4a21-a3ba-f01bb5ac3c5d'; -- Pulse Effect
UPDATE public.avatar_items SET css_class = 'shadow-xl shadow-purple-300/30' WHERE id = 'a782fb06-4a5c-4a7c-81e4-3132078574fd'; -- Sparkle Effect
UPDATE public.avatar_items SET css_class = 'transition-transform hover:scale-105' WHERE id = '67cbed97-c335-4e3b-8e4a-7ec0255c26c3'; -- Floating Effect