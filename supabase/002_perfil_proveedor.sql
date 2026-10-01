-- =============================================================
-- Brindis — 002: perfil del proveedor (fotos, paquetes y calendario)
-- Cómo usarlo: Supabase > SQL Editor > New query > pega todo > Run.
-- Se corre una sola vez, después de schema.sql.
-- =============================================================

-- 1) Capacidad máxima del proveedor (invitados)
alter table public.vendors
  add column if not exists capacity_max integer
  check (capacity_max is null or capacity_max between 1 and 5000);
grant update (capacity_max) on public.vendors to authenticated;

-- 2) Funciones de apoyo para las reglas de seguridad
create or replace function public.is_vendor_owner(vid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.vendors v where v.id = vid and v.owner_id = (select auth.uid()));
$$;

create or replace function public.is_vendor_public(vid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.vendors v where v.id = vid and v.status = 'aprobado');
$$;

grant execute on function public.is_vendor_owner(uuid) to anon, authenticated;
grant execute on function public.is_vendor_public(uuid) to anon, authenticated;

-- 3) Fotos
create table if not exists public.vendor_photos (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists vendor_photos_vendor_idx on public.vendor_photos (vendor_id, position);

-- 4) Paquetes y servicios con precio
create table if not exists public.vendor_packages (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  description text check (description is null or char_length(description) <= 800),
  price numeric(10, 2) check (price is null or price >= 0),
  price_unit text not null default 'por evento' check (price_unit in ('por evento', 'por persona', 'por hora')),
  min_guests integer check (min_guests is null or min_guests >= 0),
  max_guests integer check (max_guests is null or max_guests >= 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists vendor_packages_vendor_idx on public.vendor_packages (vendor_id, position);

-- 5) Calendario: solo se guardan los días ocupados; el resto está libre
create table if not exists public.vendor_availability (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  day date not null,
  status text not null default 'ocupada' check (status in ('ocupada', 'reservada')),
  created_at timestamptz not null default now(),
  primary key (vendor_id, day)
);
create index if not exists vendor_availability_day_idx on public.vendor_availability (day);

-- 6) Límites para cuidar el espacio gratuito: 12 fotos y 20 paquetes por proveedor
create or replace function public.check_vendor_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'vendor_photos'
     and (select count(*) from public.vendor_photos where vendor_id = new.vendor_id) >= 12 then
    raise exception 'Máximo 12 fotos por proveedor';
  end if;
  if tg_table_name = 'vendor_packages'
     and (select count(*) from public.vendor_packages where vendor_id = new.vendor_id) >= 20 then
    raise exception 'Máximo 20 paquetes por proveedor';
  end if;
  return new;
end;
$$;

drop trigger if exists vendor_photos_limit on public.vendor_photos;
create trigger vendor_photos_limit before insert on public.vendor_photos
  for each row execute function public.check_vendor_limits();
drop trigger if exists vendor_packages_limit on public.vendor_packages;
create trigger vendor_packages_limit before insert on public.vendor_packages
  for each row execute function public.check_vendor_limits();

-- 7) Seguridad: cualquiera ve lo de proveedores publicados; cada proveedor ve y edita lo suyo
alter table public.vendor_photos enable row level security;
alter table public.vendor_packages enable row level security;
alter table public.vendor_availability enable row level security;

create policy "Ver fotos" on public.vendor_photos for select to anon, authenticated
  using (public.is_vendor_public(vendor_id) or owner_id = (select auth.uid()));
create policy "Subir mis fotos" on public.vendor_photos for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_vendor_owner(vendor_id));
create policy "Ordenar mis fotos" on public.vendor_photos for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and public.is_vendor_owner(vendor_id));
create policy "Borrar mis fotos" on public.vendor_photos for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Ver paquetes" on public.vendor_packages for select to anon, authenticated
  using (public.is_vendor_public(vendor_id) or owner_id = (select auth.uid()));
create policy "Crear mis paquetes" on public.vendor_packages for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_vendor_owner(vendor_id));
create policy "Editar mis paquetes" on public.vendor_packages for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and public.is_vendor_owner(vendor_id));
create policy "Borrar mis paquetes" on public.vendor_packages for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Ver disponibilidad" on public.vendor_availability for select to anon, authenticated
  using (public.is_vendor_public(vendor_id) or owner_id = (select auth.uid()));
create policy "Marcar mis fechas" on public.vendor_availability for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_vendor_owner(vendor_id));
create policy "Cambiar mis fechas" on public.vendor_availability for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and public.is_vendor_owner(vendor_id));
create policy "Liberar mis fechas" on public.vendor_availability for delete to authenticated
  using (owner_id = (select auth.uid()));

-- 8) Espacio para las fotos (Storage): público para mostrar, cada proveedor escribe solo en su carpeta
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-photos', 'vendor-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Proveedor sube a su carpeta" on storage.objects for insert to authenticated
  with check (bucket_id = 'vendor-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Proveedor ve su carpeta" on storage.objects for select to authenticated
  using (bucket_id = 'vendor-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Proveedor borra de su carpeta" on storage.objects for delete to authenticated
  using (bucket_id = 'vendor-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
