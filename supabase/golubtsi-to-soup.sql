-- Move "Golubtsi" from main dishes (main-meal) to soups (soup).
-- Only the category and its position change; photo, price, translations and visibility stay as they are.
-- Run once in the Supabase SQL Editor of the menu project.
UPDATE public.dishes AS dish
SET category = 'soup',
    position = COALESCE((SELECT MAX(d.position) FROM public.dishes d WHERE d.category = 'soup'), 0) + 1,
    updated_at = now()
WHERE dish.category = 'main-meal'
  AND dish.image LIKE '%/golubtsi.webp';

-- Check:
-- SELECT id, category, position, names->>'uz' AS name FROM public.dishes WHERE image LIKE '%/golubtsi.webp';
