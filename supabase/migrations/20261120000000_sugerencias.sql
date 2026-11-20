-- Buzon de sugerencias de clientas.
-- Idempotente: se puede correr mas de una vez.

create table if not exists public.sugerencias (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  anonimo boolean not null default false,
  mensaje text not null,
  created_at timestamptz not null default now()
);

alter table public.sugerencias enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'sugerencias' and policyname = 'sugerencias_insert_anon'
  ) then
    create policy sugerencias_insert_anon
      on public.sugerencias
      for insert
      to anon
      with check (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'sugerencias' and policyname = 'sugerencias_select_auth'
  ) then
    create policy sugerencias_select_auth
      on public.sugerencias
      for select
      to authenticated
      using (true);
  end if;
end $$;
