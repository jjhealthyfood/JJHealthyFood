-- Menú Keto: columna es_keto + platos y proteínas keto.
-- Ejecutar en Supabase → SQL Editor.
--
-- Regla del menú keto: el cliente elige un plato keto y la proteína que lo
-- acompaña. El precio lo define la proteína (Pavo/Molida/Carne/Salmón $12,
-- Pollo $10), igual que en el modo regular.
--
-- Es idempotente: se puede correr más de una vez sin duplicar nada.

-- 1) Columna que marca qué opciones pertenecen al menú keto
alter table public.opciones_menu
  add column if not exists es_keto boolean not null default false;

-- 2) Platos keto y proteínas keto
insert into public.opciones_menu
  (categoria, nombre, nivel, precio_racion, precio_macro_gramo, orden, es_keto)
values
  -- Platos keto (el plato no define el precio: lo define la proteína)
  ('plato', 'Lasagna berenjena', null, 12, 12, 100, true),
  ('plato', 'Spaghetti zucchini', null, 10, 10, 101, true),
  ('plato', 'Salmon bowl', null, 10, 10, 102, true),

  -- Proteínas keto (definen el precio de la comida)
  ('proteina', 'Pavo', 'sencilla', 10, 10, 110, true),
  ('proteina', 'Molida', 'sencilla', 10, 10, 111, true),
  ('proteina', 'Pollo', 'sencilla', 10, 10, 112, true),
  ('proteina', 'Carne', 'premium', 12, 12, 113, true),
  ('proteina', 'Salmón', 'premium', 12, 12, 114, true)
on conflict (categoria, nombre) do update set
  nivel = excluded.nivel,
  precio_racion = excluded.precio_racion,
  precio_macro_gramo = excluded.precio_macro_gramo,
  orden = excluded.orden,
  es_keto = true;
