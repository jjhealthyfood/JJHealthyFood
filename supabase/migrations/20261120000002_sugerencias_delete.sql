-- Agregar policy de delete para usuarios autenticados.
-- Idempotente.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'sugerencias' and policyname = 'sugerencias_delete_auth'
  ) then
    create policy sugerencias_delete_auth
      on public.sugerencias
      for delete
      to authenticated
      using (true);
  end if;
end $$;
