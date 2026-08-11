-- Limite de comidas por fin de semana de entrega (domingo + lunes), para no
-- sobrepasar la capacidad de produccion mientras el negocio crece. Es
-- editable desde Configuracion (igual que los codigos de descuento), asi el
-- administrador lo puede subir cuando decida que puede hacer mas comidas.
--
-- Se cuenta contra pedidos.fecha_entrega (la fecha real de entrega, no solo
-- el dia de la semana), que domingo y el lunes siguiente forman un mismo
-- fin de semana. Los pedidos de antes de que se empezara a guardar
-- fecha_entrega no se cuentan (no se puede saber a que fin de semana
-- pertenecen con certeza).

insert into public.configuracion (clave, valor) values
  ('limite_comidas_semana', '250')
on conflict (clave) do nothing;

create or replace function public.contar_comidas_fin_de_semana(
  p_fecha_domingo date
)
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(count(cp.id), 0)::integer
  from comidas_pedido cp
  join pedidos p on p.id = cp.pedido_id
  where p.fecha_entrega in (p_fecha_domingo, p_fecha_domingo + 1);
$$;

grant execute on function public.contar_comidas_fin_de_semana(date) to anon;
