-- Nota opcional por comida individual (distinta de "notas" en pedidos,
-- que es para todo el pedido). Sirve para casos como "sin cebolla" o
-- "salsa aparte" en una comida especifica dentro de un pedido grande.

alter table public.comidas_pedido
  add column if not exists comentario text;
