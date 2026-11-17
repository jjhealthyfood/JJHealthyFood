-- Menú Keto — agregar columna es_keto y platos keto
-- Ejecutar en Supabase SQL Editor (entorno de pruebas, no producción)

-- 1) Agregar columna es_keto si no existe
alter table opciones_menu
  add column if not exists es_keto boolean not null default false;

-- 2) Insertar platos keto (evitar duplicados)
insert into opciones_menu (categoria, nombre, nivel, precio_racion, precio_macro_gramo, orden, excluido_extra, extra_price_override, solo_extra, es_keto) values
  ('plato', 'Lasaña de berenjena', null, 12, 12, 100, false, null, false, true),
  ('plato', 'Spaghetti de zucchini', null, 10, 10, 101, false, null, false, true),
  ('plato', 'Salmon bowl', null, 10, 10, 102, false, null, false, true),
  ('proteina', 'Pollo', 'sencilla', 10, 10, 103, false, null, false, true),
  ('proteina', 'Carne', 'sencilla', 12, 12, 104, false, null, false, true),
  ('proteina', 'Salmon', 'premium', 12, 12, 105, false, null, false, true)
on conflict (categoria, nombre) do update set
  nivel = excluded.nivel,
  precio_racion = excluded.precio_racion,
  precio_macro_gramo = excluded.precio_macro_gramo,
  orden = excluded.orden,
  es_keto = true;

-- 3) Marcar como NO keto las proteínas existentes que no son keto
-- (salvo si ya existen con otro nombre, esto evita que "Pollo" regular se mezcle)
update opciones_menu
set es_keto = false
where categoria in ('plato', 'proteina')
  and es_keto is null;
