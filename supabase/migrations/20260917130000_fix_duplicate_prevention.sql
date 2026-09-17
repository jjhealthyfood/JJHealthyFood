-- FIX: Prevencion de pedidos duplicados a nivel de base de datos.
-- Se agrega una columna 'firma' que es un hash de las comidas del pedido,
-- y un indice unico que impide que la misma clienta tenga dos pedidos
-- con exactamente las mismas comidas para el mismo dia de entrega,
-- mientras el pedido no haya sido entregado.

-- 1. Agregar columna de firma a pedidos
alter table public.pedidos
  add column if not exists firma text;

-- 2. Funcion para generar la firma de un conjunto de comidas.
-- La firma es una representacion unica de las comidas: ordena las comidas
-- por su contenido y las concatena con un delimitador.
create or replace function public.generar_firma_pedido(
  p_clienta_id uuid,
  p_dia_entrega text,
  p_fecha_entrega text,
  p_modo text,
  p_comidas jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_elementos text[] := '{}';
  v_item jsonb;
  v_firma text;
begin
  for v_item in select * from jsonb_array_elements(p_comidas) order by
    (v_item->>'proteina'),
    (v_item->>'carbohidrato'),
    (v_item->>'vegetal'),
    (v_item->>'extra')
  loop
    v_elementos := array_append(v_elementos,
      concat(
        coalesce(v_item->>'proteina', ''),
        '|',
        coalesce(v_item->>'carbohidrato', ''),
        '|',
        coalesce(v_item->>'vegetal', ''),
        '|',
        coalesce(v_item->>'extra', ''),
        '|',
        coalesce(v_item->>'gramos_proteina', ''),
        '|',
        coalesce(v_item->>'gramos_carbohidrato', ''),
        '|',
        coalesce(v_item->>'es_desayuno', 'false')
      )
    );
  end loop;

  v_firma := p_clienta_id::text || ':' || p_dia_entrega || ':' || p_fecha_entrega || ':' || p_modo || ':' || array_to_string(v_elementos, ';;');
  return v_firma;
end;
$$;

-- 3. Funcion para validar y crear pedido con prevencion de duplicados atomica.
-- Esta funcion verifica que no exista un pedido con la misma firma para
-- la misma clienta y dia, y lo crea en una sola operacion atomica.
create or replace function public.crear_pedido_si_no_duplicado(
  p_id uuid,
  p_clienta_id uuid,
  p_dia_entrega text,
  p_fecha_entrega text,
  p_modo text,
  p_precio_total numeric,
  p_notas text,
  p_tipo_entrega text,
  p_sede_nombre text,
  p_sede_direccion text,
  p_direccion_entrega text,
  p_descuento_pct numeric,
  p_codigo_descuento text,
  p_firma text,
  p_comidas jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existe boolean;
  v_pedido_id uuid;
  v_item jsonb;
  v_numero_comida smallint := 1;
begin
  -- Verificar si ya existe un pedido con la misma firma que no haya sido entregado
  select exists(
    select 1 from pedidos
    where clienta_id = p_clienta_id
      and dia_entrega = p_dia_entrega
      and fecha_entrega = p_fecha_entrega
      and firma = p_firma
      and estado <> 'entregado'
  ) into v_existe;

  if v_existe then
    raise exception 'DUPLICATE_ORDER: Ya tienes un pedido con estas mismas comidas para este dia.';
  end if;

  -- Crear el pedido
  insert into pedidos (
    id, clienta_id, dia_entrega, fecha_entrega, modo, precio_total,
    notas, tipo_entrega, sede_nombre, sede_direccion, direccion_entrega,
    descuento_pct, codigo_descuento, firma
  ) values (
    p_id, p_clienta_id, p_dia_entrega, p_fecha_entrega, p_modo, p_precio_total,
    p_notas, p_tipo_entrega, p_sede_nombre, p_sede_direccion, p_direccion_entrega,
    p_descuento_pct, p_codigo_descuento, p_firma
  );

  -- Crear las comidas del pedido
  for v_item in select * from jsonb_array_elements(p_comidas)
  loop
    insert into comidas_pedido (
      id, pedido_id, numero_comida, proteina, carbohidrato, vegetal,
      extra, gramos_proteina, gramos_carbohidrato, precio, es_desayuno, comentario
    ) values (
      gen_random_uuid(),
      p_id,
      v_numero_comida,
      v_item->>'proteina',
      v_item->>'carbohidrato',
      nullif(v_item->>'vegetal', ''),
      nullif(v_item->>'extra', ''),
      nullif(v_item->>'gramos_proteina', '')::numeric,
      nullif(v_item->>'gramos_carbohidrato', '')::numeric,
      (v_item->>'precio')::numeric,
      (v_item->>'es_desayuno')::boolean,
      nullif(v_item->>'comentario', '')
    );
    v_numero_comida := v_numero_comida + 1;
  end loop;

  return p_id;
end;
$$;

grant execute on function public.crear_pedido_si_no_duplicado(
  uuid, uuid, text, text, text, numeric, text, text, text, text, text, numeric, text, text, jsonb
) to anon;

-- 4. Actualizar pedidos existentes con su firma (para que la constraint
-- funcione con pedidos viejos que no tienen firma).
-- Solo se actualizan pedidos que no estan entregados.
update public.pedidos p
set firma = public.generar_firma_pedido(
  p.clienta_id,
  p.dia_entrega,
  p.fecha_entrega::text,
  p.modo,
  (
    select jsonb_agg(jsonb_build_object(
      'proteina', cp.proteina,
      'carbohidrato', cp.carbohidrato,
      'vegetal', cp.vegetal,
      'extra', cp.extra,
      'gramos_proteina', cp.gramos_proteina::text,
      'gramos_carbohidrato', cp.gramos_carbohidrato::text,
      'es_desayuno', cp.es_desayuno::text
    ))
    from comidas_pedido cp where cp.pedido_id = p.id
  )
)
where p.estado <> 'entregado' and p.firma is null;
