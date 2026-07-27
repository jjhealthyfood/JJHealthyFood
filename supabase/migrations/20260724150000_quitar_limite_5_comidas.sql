-- Bug encontrado: la restriccion original limitaba numero_comida a
-- estar entre 1 y 5, de cuando el pedido tenia un maximo fijo de 5
-- comidas. Esa limitacion nunca se quito cuando se paso a "cantidad
-- ilimitada" de comidas por pedido. Resultado: cualquier pedido de mas
-- de 5 comidas fallaba al insertar TODAS sus comidas de una (el INSERT
-- de varias filas es atomico, si una fila viola el check se cancelan
-- todas), dejando el pedido ya creado (con su precio) pero sin ninguna
-- comida guardada y sin enviar el WhatsApp.

do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.comidas_pedido'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%numero_comida%'
  loop
    execute format('alter table public.comidas_pedido drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.comidas_pedido
  add constraint comidas_pedido_numero_comida_check
  check (numero_comida >= 1);
