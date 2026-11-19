-- Marcar las comidas keto dentro del pedido.
--
-- El plato keto se guarda en la columna carbohidrato (es el "acompañante"
-- del plato), asi que sin esta bandera el Resumen de Cocina lo contaba como
-- un carbohidrato. Con es_keto la cocina lo agrupa aparte: plato + proteina.
--
-- Idempotente: se puede correr mas de una vez.

alter table public.comidas_pedido
  add column if not exists es_keto boolean not null default false;

-- Pedidos viejos: no hay comidas keto previas, asi que el default false deja
-- todo igual que antes.
