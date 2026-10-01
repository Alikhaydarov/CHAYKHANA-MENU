-- Apply after this versioned asset is published. Only the clipped plate photo
-- is repaired; the old asset remains available for cached menu responses.
UPDATE public.dishes
SET image = '/assets/pdf-menu/food-real-v2/grilled-chicken-v3.webp'
WHERE id = 25
  AND category = 'main-meal'
  AND image = '/assets/pdf-menu/food-real-v2/grilled-chicken.webp';
