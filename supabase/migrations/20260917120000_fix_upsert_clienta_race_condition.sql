-- FIX: Race condition en upsert_clienta_publica.
-- La version anterior usaba UPDATE-then-INSERT, lo que causaba que dos
-- requests concurrentes con el mismo telefono ambos fallaran el UPDATE
-- (0 filas) e intentaran INSERT, violando el constraint UNIQUE.
-- Se reemplaza con INSERT ... ON CONFLICT que es atomico.

create or replace function public.upsert_clienta_publica(
  p_telefono text,
  p_nombre text,
  p_direccion text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Intentar insertar directamente; si ya existe un registro con el
  -- mismo telefono, actualizar nombre y direccion (solo si se proporciono
  -- una direccion no vacia).
  insert into clientas (nombre, telefono, direccion)
  values (p_nombre, p_telefono, nullif(p_direccion, ''))
  on conflict (telefono) do update
    set nombre = p_nombre,
        direccion = coalesce(nullif(p_direccion, ''), clientas.direccion)
  returning id into v_id;

  return v_id;
end;
$$;

-- Asegurar que el rol anon tenga permiso de ejecucion (por si se perdio
-- durante algun recreado de la funcion).
grant execute on function public.upsert_clienta_publica(text, text, text) to anon, authenticated;
