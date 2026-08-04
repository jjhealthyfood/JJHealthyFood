-- Permite chequear, desde el rol publico (anon), si una clienta ya tiene
-- un pedido pendiente/en preparacion para el mismo dia con exactamente
-- las mismas comidas, sin darle acceso general de lectura a la tabla
-- pedidos (que sigue bloqueada para anon por diseno).

create or replace function public.comidas_pendientes_de_clienta_dia(
  p_clienta_id uuid,
  p_dia_entrega text
)
returns table (
  pedido_id uuid,
  proteina text,
  carbohidrato text,
  vegetal text,
  extra text,
  gramos_proteina numeric,
  gramos_carbohidrato numeric,
  es_desayuno boolean
)
language sql
security definer
set search_path = public
as $$
  select cp.pedido_id, cp.proteina, cp.carbohidrato, cp.vegetal, cp.extra,
         cp.gramos_proteina, cp.gramos_carbohidrato, cp.es_desayuno
  from comidas_pedido cp
  join pedidos p on p.id = cp.pedido_id
  where p.clienta_id = p_clienta_id
    and p.dia_entrega = p_dia_entrega
    and p.estado <> 'entregado';
$$;

grant execute on function public.comidas_pendientes_de_clienta_dia(uuid, text) to anon;
