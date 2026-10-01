-- Content ordering only: meat dishes, rice, then dough-based dishes.
-- Photos, prices, translations and visibility remain unchanged.
WITH menu_order(id, position) AS (
  VALUES (18, 1), (15, 2), (20, 3), (21, 4), (26, 5), (27, 6),
         (19, 7), (23, 8), (25, 9), (32, 10), (24, 11), (30, 12),
         (28, 13), (14, 14), (16, 15), (17, 16), (22, 17), (31, 18)
)
UPDATE public.dishes AS dish
SET position = menu_order.position
FROM menu_order
WHERE dish.id = menu_order.id AND dish.category = 'main-meal';
