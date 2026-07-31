-- Agrega la opcion de delivery ademas de pickup. El cliente elige uno u
-- otro; para delivery escribe su propia direccion en vez de elegir sede.

alter table public.pedidos
  add column if not exists tipo_entrega text not null default 'pickup'
    check (tipo_entrega in ('pickup', 'delivery')),
  add column if not exists direccion_entrega text;
