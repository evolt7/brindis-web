-- =============================================================
-- Brindis — esquema de base de datos para Supabase
-- Cómo usarlo: Supabase > SQL Editor > New query > pega todo > Run.
-- Se puede correr una sola vez en un proyecto nuevo.
-- =============================================================

-- 1) Perfiles: uno por cada cuenta (pareja o proveedor)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'pareja' check (role in ('pareja', 'proveedor', 'admin')),
  full_name text,
  phone text,
  whatsapp_opt_in boolean not null default false,
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2) Eventos de parejas y familias
create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  event_type text,
  event_date date,
  city text,
  guests text,
  budget text,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cotizando', 'reservado', 'realizado', 'cancelado')),
  notes text,
  created_at timestamptz not null default now()
);
create index events_owner_idx on public.events (owner_id);
create index events_date_idx on public.events (event_date);

-- 3) Negocios de proveedores
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  business_name text not null,
  category text,
  city text,
  social text,
  price_from text,
  description text,
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobado', 'pausado', 'rechazado')),
  created_at timestamptz not null default now()
);
create index vendors_status_idx on public.vendors (status, category, city);

-- 4) Al crear una cuenta se llenan automáticamente las tablas con lo que la persona escribió en el formulario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text := case when meta ->> 'role' = 'proveedor' then 'proveedor' else 'pareja' end;
  v_date date := case when coalesce(meta ->> 'event_date', '') ~ '^\d{4}-\d{2}-\d{2}$'
                      then (meta ->> 'event_date')::date else null end;
begin
  insert into public.profiles (id, role, full_name, phone, whatsapp_opt_in, accepted_terms_at)
  values (
    new.id,
    v_role,
    left(meta ->> 'full_name', 120),
    left(meta ->> 'phone', 30),
    coalesce((meta ->> 'whatsapp_opt_in')::boolean, false),
    now()
  );

  if v_role = 'pareja' then
    insert into public.events (owner_id, event_type, event_date, city, guests, budget)
    values (
      new.id,
      left(meta ->> 'event_type', 60),
      v_date,
      left(meta ->> 'event_city', 60),
      left(meta ->> 'event_guests', 30),
      left(meta ->> 'event_budget', 40)
    );
  else
    insert into public.vendors (owner_id, business_name, category, city, social, price_from, description)
    values (
      new.id,
      coalesce(nullif(left(meta ->> 'business_name', 120), ''), 'Sin nombre'),
      left(meta ->> 'category', 60),
      left(meta ->> 'vendor_city', 60),
      left(meta ->> 'social', 200),
      left(meta ->> 'price_from', 20),
      left(meta ->> 'description', 600)
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Seguridad: cada persona solo ve y edita lo suyo
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.vendors enable row level security;

create policy "Ver mi perfil" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Editar mi perfil" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Ver mis eventos" on public.events
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Crear mis eventos" on public.events
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Editar mis eventos" on public.events
  for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "Ver mi negocio" on public.vendors
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Ver negocios publicados" on public.vendors
  for select to anon, authenticated using (status = 'aprobado');
create policy "Editar mi negocio" on public.vendors
  for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- Nadie puede cambiarse el rol ni aprobarse a sí mismo: solo tú, desde el panel de Supabase
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone, whatsapp_opt_in) on public.profiles to authenticated;
revoke insert, update on public.events from authenticated, anon;
grant insert (owner_id, event_type, event_date, city, guests, budget, notes) on public.events to authenticated;
grant update (event_type, event_date, city, guests, budget, notes) on public.events to authenticated;
revoke update on public.vendors from authenticated, anon;
grant update (business_name, category, city, social, price_from, description) on public.vendors to authenticated;

-- 6) Vista para ti: todos los registros en una sola tabla (ábrela en Table Editor)
create or replace view public.registros
with (security_invoker = on) as
select
  p.created_at as registrado,
  p.role as tipo,
  p.full_name as nombre,
  p.phone as whatsapp,
  u.email as correo,
  coalesce(v.business_name, e.event_type) as negocio_o_evento,
  coalesce(v.category, e.guests) as categoria_o_invitados,
  e.event_date as fecha_evento,
  coalesce(v.city, e.city) as ciudad,
  coalesce(v.status, e.status) as estado
from public.profiles p
join auth.users u on u.id = p.id
left join public.events e on e.owner_id = p.id
left join public.vendors v on v.owner_id = p.id
order by p.created_at desc;

revoke all on public.registros from anon, authenticated;
