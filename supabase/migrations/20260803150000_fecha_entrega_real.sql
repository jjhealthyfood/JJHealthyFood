-- Los ingresos mensuales se calculaban con fecha_pedido (cuando se hizo
-- el pedido), no con la fecha real de entrega. Un pedido armado a fin de
-- mes para retirar la semana siguiente quedaba fuera del mes en que
-- realmente se entrego y se cobro. Se agrega entregado_en para usar la
-- fecha real de entrega en los calculos de ingresos.

alter table public.pedidos
  add column if not exists entregado_en timestamptz;
