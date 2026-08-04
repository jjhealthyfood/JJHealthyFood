-- Codigos de descuento (5% y 10%) que la clienta puede ingresar al
-- llegar al resumen del pedido. Los codigos en si viven en
-- "configuracion" (clave/valor), editables desde el dashboard, igual
-- que el numero de WhatsApp.

alter table public.pedidos
  add column if not exists descuento_pct smallint not null default 0
    check (descuento_pct in (0, 5, 10)),
  add column if not exists codigo_descuento text;

insert into public.configuracion (clave, valor) values
  ('codigo_descuento_5', 'JJ5OFF'),
  ('codigo_descuento_10', 'JJ10OFF')
on conflict (clave) do nothing;
