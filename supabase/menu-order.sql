-- Content ordering only. Categories, photos, prices, translations and visibility
-- stay unchanged. Apply manually; future admin reordering remains authoritative.
WITH category_order(category, dish_ids) AS (
  VALUES
    -- Lamb dishes, beef dishes, chicken, rice, then dough-based dishes.
    -- Hidden Assorti osh stays beside Osh when made visible later.
    ('main-meal', ARRAY[18,15,26,20,21,32,27,19,23,24,25,30,29,14,28,16,17,22,31]::bigint[]),
    -- Meat broths, vegetable/rice soups, then noodle/dumpling soups.
    ('soup', ARRAY[8,13,9,11,10,12]::bigint[]),
    -- Lamb, beef, then chicken; keep related beef preparations together.
    ('kebabs', ARRAY[75,66,64,73,72]::bigint[]),
    -- Prepared salads, fresh vegetables, dairy sides, then pickles.
    ('salad', ARRAY[33,34,35,36,39,40,37,38,41,42,43]::bigint[]),
    -- Egg/sausage dish, potatoes, grains, then pasta.
    ('garnish', ARRAY[44,45,46,49,47,48]::bigint[]),
    -- Meat-filled breads, plain breads, then cottage-cheese pancakes.
    ('bread', ARRAY[67,71,70,69,68,74,65,50]::bigint[])
), menu_order AS (
  SELECT category, item.id, item.position::integer AS position
  FROM category_order
  CROSS JOIN LATERAL unnest(dish_ids) WITH ORDINALITY AS item(id, position)
)
UPDATE public.dishes AS dish
SET position = menu_order.position
FROM menu_order
WHERE dish.id = menu_order.id
  AND dish.category = menu_order.category
  AND dish.position IS DISTINCT FROM menu_order.position;
