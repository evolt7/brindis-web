-- =============================================================
-- Brindis — 003: proveedores guardados en el evento de cada pareja
-- Cómo usarlo: Supabase > SQL Editor > New query > pega todo > Run.
-- Se corre una sola vez, después de 002_perfil_proveedor.sql.
-- =============================================================

create or replace function public.is_event_owner(eid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.events e where e.id = eid and e.owner_id = (select auth.uid()));
$$;
grant execute on function public.is_event_owner(uuid) to authenticated;

create table if not exists public.event_vendors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  status text not null default 'guardado' check (status in ('guardado', 'cotizando', 'reservado', 'descartado')),
  created_at timestamptz not null default now(),
  unique (event_id, vendor_id)
);
create index if not exists event_vendors_owner_idx on public.event_vendors (owner_id);
create index if not exists event_vendors_vendor_idx on public.event_vendors (vendor_id);

-- Máximo 40 proveedores guardados por evento
create or replace function public.check_event_vendor_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.event_vendors where event_id = new.event_id) >= 40 then
    raise exception 'Máximo 40 proveedores guardados por evento';
  end if;
  return new;
end;
$$;
drop trigger if exists event_vendors_limit on public.event_vendors;
create trigger event_vendors_limit before insert on public.event_vendors
  for each row execute function public.check_event_vendor_limit();

alter table public.event_vendors enable row level security;

create policy "Ver mis proveedores guardados" on public.event_vendors for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Guardar proveedor en mi evento" on public.event_vendors for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_event_owner(event_id) and public.is_vendor_public(vendor_id));
create policy "Quitar proveedor de mi evento" on public.event_vendors for delete to authenticated
  using (owner_id = (select auth.uid()));

-- La pareja solo elige qué guardar; el estado (cotizando, reservado) lo cambia Brindis
revoke insert, update on public.event_vendors from authenticated, anon;
grant insert (event_id, vendor_id) on public.event_vendors to authenticated;
