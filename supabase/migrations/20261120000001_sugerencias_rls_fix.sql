-- Fix RLS: permitir insert a todos (anon y authenticated).
-- Idempotente.

drop policy if exists sugerencias_insert_anon on public.sugerencias;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'sugerencias' and policyname = 'sugerencias_insert_public'
  ) then
    create policy sugerencias_insert_public
      on public.sugerencias
      for insert
      to public
      with check (true);
  end if;
end $$;
