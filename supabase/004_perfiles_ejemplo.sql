-- =============================================================
-- Brindis — 004: 36 perfiles de ejemplo (3 por categoría)
-- Cómo usarlo: Supabase > SQL Editor > New query > pega todo > Run.
-- Se puede correr varias veces: borra los ejemplos anteriores y los vuelve a crear.
--
-- Los negocios son INVENTADOS y se muestran con la etiqueta "Perfil de ejemplo".
-- Fotos: Unsplash (licencia libre de Unsplash, uso comercial permitido).
-- Precios: referencias estimadas del mercado en Quito.
--
-- Para BORRAR todos los ejemplos cuando ya tengas proveedores reales:
--   delete from public.vendors where is_demo;
-- =============================================================

-- 1) Estructura para perfiles sin dueño
alter table public.vendors add column if not exists is_demo boolean not null default false;
alter table public.vendors alter column owner_id drop not null;
alter table public.vendor_photos alter column owner_id drop not null;
alter table public.vendor_packages alter column owner_id drop not null;
alter table public.vendor_availability alter column owner_id drop not null;

-- 2) Los ejemplos no se pueden guardar en un evento
create or replace function public.is_vendor_demo(vid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select v.is_demo from public.vendors v where v.id = vid), false);
$$;
grant execute on function public.is_vendor_demo(uuid) to authenticated;

drop policy if exists "Guardar proveedor en mi evento" on public.event_vendors;
create policy "Guardar proveedor en mi evento" on public.event_vendors for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_event_owner(event_id)
              and public.is_vendor_public(vendor_id) and not public.is_vendor_demo(vendor_id));

-- 3) Borrar ejemplos anteriores (fotos, paquetes y fechas se borran solos)
delete from public.vendors where is_demo;

-- 4) Perfiles de ejemplo

-- Venue o hacienda: Hacienda Piedra Alta
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Hacienda Piedra Alta', 'Venue o hacienda', 'Quito y valles', '2800', 250, 'Hacienda colonial en Puembo, a 30 minutos de Quito, con capilla propia, jardines de eucalipto y un salón cubierto con chimenea para las noches frías. Ceremonia y recepción en el mismo lugar, parqueadero para 80 autos y habitaciones para los novios.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1566251693773-dc466258e7c2?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1696204868903-91d809b4df09?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1578730169862-749bbdc763a8?auto=format&fit=crop&w=1600&q=80', 2),
    ('https://images.unsplash.com/photo-1711946422013-ef9ad7403277?auto=format&fit=crop&w=1600&q=80', 3)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Alquiler de la hacienda', 'Uso exclusivo por 10 horas
Capilla, jardines y salón cubierto
Parqueadero y guardianía
Suite de los novios', 2800, 'por evento', 50, 250, 0),
    ('Paquete todo incluido', 'Hacienda por 10 horas
Menú de tres tiempos y cóctel de bienvenida
Mobiliario, mantelería y vajilla
DJ y sonido por 5 horas', 68, 'por persona', 100, 250, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Venue o hacienda: Quinta Jardín del Guabo
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Quinta Jardín del Guabo', 'Venue o hacienda', 'Quito y valles', '1900', 180, 'Quinta en Tumbaco con un jardín amplio para ceremonias al aire libre y una carpa transparente lista por si llueve. Ideal para bodas de día y celebraciones familiares, con zona infantil y vista a los volcanes en días despejados.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1670529776180-60e4132ab90c?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1677768062491-07f280ff830a?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1574482211311-45a2169db57c?auto=format&fit=crop&w=1600&q=80', 2),
    ('https://images.unsplash.com/photo-1721677337543-37b07e7e28b5?auto=format&fit=crop&w=1600&q=80', 3)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Jardín + carpa', 'Uso de la quinta por 8 horas
Carpa transparente con piso
Baños y camerino
Parqueadero para 50 autos', 1900, 'por evento', 40, 180, 0),
    ('Boda íntima', 'Quinta por 6 horas
Almuerzo de tres tiempos
Decoración básica de mesas
Coordinador del lugar', 55, 'por persona', 30, 80, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-17', '2026-11-14', '2026-12-12', '2027-01-09', '2027-02-06', '2027-03-06', '2027-04-03', '2027-05-01', '2027-05-29', '2027-06-26']) as d;

-- Venue o hacienda: Salón Cristal del Norte
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Salón Cristal del Norte', 'Venue o hacienda', 'Quito y valles', '2200', 320, 'Salón de eventos en el norte de Quito con candelabros de cristal, pista de baile de madera y cocina propia. Pensado para bodas de noche y fiestas grandes, cerca de hoteles y con fácil acceso para los invitados.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1712314947761-a8d718bd8c32?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1665607437981-973dcd6a22bb?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1717680281618-442cb9c12b6c?auto=format&fit=crop&w=1600&q=80', 2),
    ('https://images.unsplash.com/photo-1768851142332-75f3d1b47452?auto=format&fit=crop&w=1600&q=80', 3)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Salón de noche', 'Salón de 18:00 a 03:00
Mobiliario y mantelería
Sonido básico y pista de baile
Personal de limpieza y seguridad', 2200, 'por evento', 120, 320, 0),
    ('Paquete banquete', 'Salón completo
Menú de tres tiempos
Brindis con espumante
Pastel de boda sencillo', 48, 'por persona', 120, 320, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Catering: Sabores de la Sierra Catering
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Sabores de la Sierra Catering', 'Catering', 'Quito y valles', '28', 400, 'Cocina ecuatoriana con presentación gourmet: locro, fritada fina, seco de chivo y postres tradicionales reinterpretados. Atendemos bodas, aniversarios y bodas de oro en Quito y los valles, con meseros uniformados y vajilla incluida.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1576842546422-60562b9242ae?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1616734755909-bb016ce64930?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Menú de tres tiempos', 'Entrada, plato fuerte y postre
Meseros (1 por cada 15 invitados)
Vajilla, cristalería y mantelería
Degustación para 2 personas', 32, 'por persona', 60, 400, 0),
    ('Buffet criollo', 'Tres proteínas y cinco acompañantes
Estación de postres típicos
Personal de servicio
Montaje y desmontaje', 28, 'por persona', 80, 400, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Catering: Mesa Larga Banquetes
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Mesa Larga Banquetes', 'Catering', 'Quito y valles', '35', 350, 'Buffets internacionales y estaciones de comida para que los invitados elijan: pastas al momento, parrilla, ceviches y mesa de quesos. Nos encanta el formato de mesa larga compartida.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1740047602722-b4993b79e4b7?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1637059395523-d5a35541d544?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1651964060295-ef9e1ee08667?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Buffet internacional', 'Cuatro proteínas y seis acompañantes
Estación de ensaladas
Personal de servicio y vajilla', 35, 'por persona', 80, 350, 0),
    ('Estaciones gourmet', 'Cuatro estaciones a elección
Cóctel de bienvenida con bocaditos
Chef en sitio
Vajilla y personal', 45, 'por persona', 100, 350, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Catering: Olivo & Sal Cocina de Autor
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Olivo & Sal Cocina de Autor', 'Catering', 'Quito y valles', '48', 180, 'Menús de autor emplatados con producto local de temporada: trucha de los Andes, cerdo glaseado con naranjilla y chocolate ecuatoriano. Para bodas que quieren que la comida sea parte del recuerdo.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1565898094840-7e408a6f361d?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1710587385302-38ad6020c83d?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Menú de autor de cuatro tiempos', 'Amuse-bouche, entrada, fuerte y postre
Maridaje sugerido
Chef y meseros
Degustación para 4 personas', 55, 'por persona', 40, 180, 0),
    ('Cóctel de bienvenida', 'Seis bocaditos por persona
Dos horas de servicio
Meseros', 14, 'por persona', 40, 180, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Música y DJ: Orquesta Noche Brava
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Orquesta Noche Brava', 'Música y DJ', 'Quito y valles', '2400', null, 'Orquesta de 10 músicos con repertorio de salsa, merengue, cumbia, música nacional y clásicos para bailar toda la noche. Llevamos nuestro propio sonido e iluminación de escenario.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1541002610386-cbea235ba989?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1646177184147-06d8976a2656?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1606403444347-fdd6b74492d1?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Show de 3 sets', 'Tres sets de 45 minutos
Sonido e iluminación de escenario
Maestro de ceremonias', 2400, 'por evento', null, null, 0),
    ('Show + DJ toda la noche', 'Tres sets en vivo
DJ entre sets y hasta el cierre
Sonido, luces y pista LED', 3100, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Música y DJ: Pulso DJ & Sonido
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Pulso DJ & Sonido', 'Música y DJ', 'Quito y valles', '650', null, 'DJ para bodas y fiestas con mezcla en vivo de reguetón, salsa, rock en español, electrónica y los clásicos que nunca fallan. Armamos la playlist contigo y leemos la pista para que nadie se siente.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1541126274323-dbac58d14741?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1714972383523-7c636d2f0e9b?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('DJ + sonido 6 horas', 'DJ por 6 horas
Sonido para hasta 200 personas
Micrófono inalámbrico
Reunión previa para la playlist', 650, 'por evento', null, null, 0),
    ('DJ + sonido + luces + pista LED', 'Todo lo del paquete anterior
Iluminación robótica
Pista LED 5 x 5 m
Máquina de humo bajo', 1150, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Música y DJ: Trío Serenata Andina
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Trío Serenata Andina', 'Música y DJ', 'Quito y valles', '280', null, 'Trío de guitarras y voces para la ceremonia, el cóctel o una serenata sorpresa: pasillos, boleros, música andina y baladas. Perfecto para bodas de oro y aniversarios.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1769230367366-13ed92feb145?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1764593821795-063c3ee55d6c?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1775126964224-99c03c0e439c?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Ceremonia', 'Música para la ceremonia (45 minutos)
Canciones a elección de los novios
Sonido incluido', 280, 'por evento', null, null, 0),
    ('Ceremonia + cóctel', 'Dos horas de música
Repertorio a elección
Sonido incluido', 480, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Fotografía y video: Luz de Andes Fotografía
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Luz de Andes Fotografía', 'Fotografía y video', 'Quito y valles', '1200', null, 'Fotografía de bodas con estilo documental: momentos reales, luz natural y retratos con paisajes de la sierra. Entregamos la galería en línea en cuatro semanas.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1519741196428-6a2175fa2557?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1629756048377-09540f52caa1?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1503525443530-339273ca8a86?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Cobertura de foto 8 horas', 'Fotógrafo principal y asistente
400 fotos editadas
Galería en línea para compartir', 1200, 'por evento', null, null, 0),
    ('Foto + video + dron', 'Cobertura de 10 horas
Video resumen de 5 minutos
Tomas con dron
500 fotos editadas', 2400, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Fotografía y video: Instante Eterno Films
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Instante Eterno Films', 'Fotografía y video', 'Quito y valles', '1500', null, 'Videos de boda con estilo cinematográfico: votos, discursos y la fiesta contados como una película corta. Trabajamos con dos camarógrafos y audio profesional.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1622277430358-f4d134452e2e?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1506355639690-a1f2a100689e?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1611550287705-7ff8b459c8eb?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Película resumen', 'Video de 5 minutos con música
Dos camarógrafos
Entrega en seis semanas', 1500, 'por evento', null, null, 0),
    ('Película completa', 'Resumen de 5 minutos
Ceremonia y discursos completos
Tomas con dron
Audio profesional', 2600, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Fotografía y video: Revela Estudio
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Revela Estudio', 'Fotografía y video', 'Quito y valles', '850', null, 'Estudio de fotografía para bodas y sesiones preboda en los páramos y lagunas cerca de Quito. Imprimimos álbumes de lino hechos a mano.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1756143058493-2d14887e41e6?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1722805740177-04256b6517f2?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1519689950823-0a2251441815?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Cobertura 6 horas', 'Un fotógrafo
300 fotos editadas
Galería en línea', 850, 'por evento', null, null, 0),
    ('Preboda + boda + álbum', 'Sesión preboda de 2 horas
Cobertura de boda de 8 horas
Álbum de 30 páginas', 1650, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-17', '2026-11-14', '2026-12-12', '2027-01-09', '2027-02-06', '2027-03-06', '2027-04-03', '2027-05-01', '2027-05-29', '2027-06-26']) as d;

-- Flores y decoración: Pétalo Blanco Floristería
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Pétalo Blanco Floristería', 'Flores y decoración', 'Quito y valles', '180', null, 'Floristería especializada en rosas ecuatorianas de exportación y flores de temporada. Ramos de novia, boutonnieres, arreglos de ceremonia y centros de mesa.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1544577080-91762bc7f475?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1607861876572-07754b7bba0d?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Ramo de novia + boutonnieres', 'Ramo de novia
Ramo para lanzar
Seis boutonnieres', 180, 'por evento', null, null, 0),
    ('Ceremonia y centros de mesa', 'Arreglos para altar o arco
Pasillo con pétalos
15 centros de mesa', 1400, 'por evento', null, 150, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Flores y decoración: Atelier Verde Decoración
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Atelier Verde Decoración', 'Flores y decoración', 'Quito y valles', '1200', null, 'Decoración integral de bodas: arcos florales, follaje colgante, mesas imperiales y ambientación de cada espacio. Diseñamos una propuesta a la medida con boceto previo.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1636005429095-3547c4817f78?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1724847664831-27b55fef3121?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1505406165273-6631d6f7fc68?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Arco de ceremonia + pasillo', 'Arco floral
Pasillo decorado
Montaje y desmontaje', 1200, 'por evento', null, null, 0),
    ('Decoración integral', 'Ceremonia, cóctel y recepción
Centros de mesa y mesa principal
Boceto y prueba previa', 2800, 'por evento', null, 200, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Flores y decoración: Vela & Lino Ambientación
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Vela & Lino Ambientación', 'Flores y decoración', 'Quito y valles', '900', null, 'Ambientación romántica con velas, textiles de lino y flores secas. Ideal para bodas íntimas, cenas de aniversario y recepciones de noche.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1644135129271-e80c8c673511?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1522058171200-e61f77c7353d?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1613067532295-b4f1760616cd?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Ambientación de velas', 'Velas para mesas y pasillo
Faroles y portavelas
Montaje y retiro', 900, 'por evento', null, 120, 0),
    ('Mesa imperial + textiles', 'Caminos de mesa de lino
Servilletas y bajo platos
Flores secas y velas', 1600, 'por evento', null, 120, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Pastel y dulces: Dulce Cumbre Pastelería
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Dulce Cumbre Pastelería', 'Pastel y dulces', 'Quito y valles', '5', null, 'Pasteles de boda de varios pisos con fondant o crema, decorados con flores naturales. Sabores clásicos y de la casa: naranjilla, maracuyá y chocolate ecuatoriano.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1525257831700-183b9b8bf5c4?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1632396690014-cf7a0a2f3bbb?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Pastel de boda', 'Porción por invitado
Dos sabores a elección
Decoración con flores naturales
Degustación previa', 5, 'por persona', 50, 300, 0),
    ('Pastel + mesa de postres', 'Pastel de boda
Cuatro postres individuales por persona
Montaje de la mesa', 9, 'por persona', 80, 300, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-17', '2026-11-14', '2026-12-12', '2027-01-09', '2027-02-06', '2027-03-06', '2027-04-03', '2027-05-01', '2027-05-29', '2027-06-26']) as d;

-- Pastel y dulces: Azúcar Morena Postres
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Azúcar Morena Postres', 'Pastel y dulces', 'Quito y valles', '380', null, 'Mesas de dulces que también son decoración: macarons, cupcakes, alfajores, cake pops y bombones. Diseñamos la mesa con los colores de tu evento.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1637059395717-109549c5d055?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Mesa de dulces para 100', 'Seis tipos de dulces
Mobiliario y bases
Decoración de la mesa', 380, 'por evento', null, 100, 0),
    ('Mesa de dulces premium para 150', 'Nueve tipos de dulces
Macarons personalizados
Letrero con nombres', 620, 'por evento', null, 150, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-17', '2026-11-14', '2026-12-12', '2027-01-09', '2027-02-06', '2027-03-06', '2027-04-03', '2027-05-01', '2027-05-29', '2027-06-26']) as d;

-- Pastel y dulces: La Bandeja Repostería
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'La Bandeja Repostería', 'Pastel y dulces', 'Quito y valles', '3', null, 'Repostería tradicional quiteña para eventos: quesadillas, alfajores, bocadillos, empanadas de viento y pristiños. El sabor de casa que los invitados recuerdan.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1623428454614-abaf00244e52?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1519654793190-2e8a4806f1f2?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1581745069539-1e60d7f965f4?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Bocaditos dulces', 'Seis bocaditos por persona
Presentación en bandejas', 3, 'por persona', 50, null, 0),
    ('Pastel tradicional de frutas', 'Pastel de frutas confitadas
Porción por invitado
Decoración sencilla', 4, 'por persona', 50, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Hora loca: Fiesta Total Hora Loca
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Fiesta Total Hora Loca', 'Hora loca', 'Quito y valles', '320', null, 'Hora loca con personajes, zanqueros, cotillón y la música que levanta a todos de la silla. Animación para bodas, quinceañeras y fiestas de empresa.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1764269719300-7094d6c00533?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Hora loca clásica', '45 minutos de show
Cuatro personajes
Cotillón para 100 personas', 320, 'por evento', null, null, 0),
    ('Hora loca + zanqueros', '45 minutos de show
Dos zanqueros y cuatro personajes
Papel picado y cotillón', 520, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Hora loca: Carnaval Show
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Carnaval Show', 'Hora loca', 'Quito y valles', '450', null, 'Batucada brasileña y bailarinas para una hora loca con energía de carnaval. Plumas, tambores y una entrada que nadie olvida.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1714972383570-44ddc9738355?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1548849198-9531e306d1d3?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1610229452706-666ac2d49c45?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Hora loca carnaval', '40 minutos de show
Cuatro bailarinas
Cotillón', 450, 'por evento', null, null, 0),
    ('Batucada + bailarinas', 'Batucada de seis músicos
Cuatro bailarinas
Entrada sorpresa', 650, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Hora loca: Locos por la Fiesta
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Locos por la Fiesta', 'Hora loca', 'Quito y valles', '280', null, 'Robots LED, cañones de CO2, máscaras y cotillón para cerrar la noche en alto. Armamos el show según la edad y el estilo de tus invitados.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1775126964346-d4b6e7c5e4f0?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1779893529781-3ae4c32c43c0?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1584890132374-d69d5d01483e?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Hora loca + cotillón', '45 minutos de show
Cotillón para 100 personas
Máscaras y lentes', 380, 'por evento', null, 100, 0),
    ('Robot LED + CO2', 'Robot LED de 2,5 m
Dos cañones de CO2
30 minutos de show', 480, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Belleza: Novia Radiante Makeup & Hair
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Novia Radiante Makeup & Hair', 'Belleza', 'Quito y valles', '180', null, 'Maquillaje y peinado de novia a domicilio en Quito y los valles. Incluye prueba previa para encontrar el look que te haga sentir tú misma.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1672788725446-c303ec2b318e?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1722805740076-7c51a8669afc?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1549236177-77e8271c34b6?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Novia: prueba + día de la boda', 'Prueba de maquillaje y peinado
Maquillaje y peinado el día del evento
Retoque para la fiesta', 250, 'por evento', null, null, 0),
    ('Maquillaje para mamás y damas', 'Maquillaje social
Pestañas incluidas
A domicilio desde 4 personas', 45, 'por persona', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-17', '2026-11-14', '2026-12-12', '2027-01-09', '2027-02-06', '2027-03-06', '2027-04-03', '2027-05-01', '2027-05-29', '2027-06-26']) as d;

-- Belleza: Estudio Rizo y Rubor
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Estudio Rizo y Rubor', 'Belleza', 'Quito y valles', '160', null, 'Salón de belleza en Cumbayá con un espacio privado para la novia y su cortejo. Peinados, maquillaje y manicure el mismo día.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1629326017926-9cad9c909196?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1672788709547-6d7f239972c3?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1523264114838-feca761983c4?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Peinado + maquillaje de novia', 'Peinado y maquillaje
Pestañas
Bebidas para el cortejo', 180, 'por evento', null, null, 0),
    ('Paquete cortejo', 'Peinado o maquillaje para 5 personas
Espacio privado por 3 horas', 220, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Belleza: Brillo Natural Beauty
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Brillo Natural Beauty', 'Belleza', 'Quito y valles', '150', null, 'Maquillaje con aerógrafo de larga duración y estilo natural, ideal para bodas de día y fotos en exteriores. Productos libres de crueldad animal.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1713548902214-bd930728bd89?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1586342805832-c0f10f33ac3d?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1549236177-f9b0031756eb?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Maquillaje con aerógrafo', 'Maquillaje de novia con aerógrafo
Prueba previa
Kit de retoque', 200, 'por evento', null, null, 0),
    ('Spa día previo', 'Manicure y pedicure
Facial hidratante', 90, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Mobiliario e iluminación: Montaje Real Alquileres
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Montaje Real Alquileres', 'Mobiliario e iluminación', 'Quito y valles', '9', null, 'Alquiler de sillas tiffany, mesas redondas e imperiales, mantelería, vajilla y cristalería. Hacemos el montaje y el retiro sin que tengas que preocuparte.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1700514077430-3659e38eb5e7?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1643066873293-686f7370f9d7?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Mobiliario completo', 'Silla tiffany y mesa
Mantelería y servilleta
Vajilla y cristalería
Montaje y retiro', 9, 'por persona', 50, null, 0),
    ('Mesa imperial de madera', 'Mesa de madera rústica
Silla crossback
Camino de mesa', 12, 'por persona', 30, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Mobiliario e iluminación: Lumina Eventos
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Lumina Eventos', 'Mobiliario e iluminación', 'Quito y valles', '600', null, 'Iluminación para bodas: guirnaldas de luz cálida, iluminación de fachada, pista LED y efectos para el primer baile.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1653821355736-0c2598d0a63e?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1653821355226-6def361cc7ab?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1485178075098-49f78b4b43b4?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Guirnaldas y luz cálida', '200 metros de guirnaldas
Instalación y retiro', 600, 'por evento', null, null, 0),
    ('Iluminación integral + pista LED', 'Guirnaldas y luz de fachada
Pista LED 6 x 6 m
Técnico toda la noche', 1500, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Mobiliario e iluminación: Carpa & Salón Andino
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Carpa & Salón Andino', 'Mobiliario e iluminación', 'Quito y valles', '1400', null, 'Carpas transparentes y blancas con piso, cortinas y calefactores para las noches frías de la sierra. Convertimos cualquier jardín en un salón.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1759306221569-028a35bc8c66?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1643066873594-4df339b2e232?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Carpa para 150 personas', 'Carpa transparente con piso
Cortinas laterales
Montaje y retiro', 1800, 'por evento', null, 150, 0),
    ('Calefactores', 'Seis calefactores a gas
Gas incluido para 6 horas', 240, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Transporte: Clásicos del Ayer
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Clásicos del Ayer', 'Transporte', 'Quito y valles', '280', null, 'Autos clásicos restaurados con chofer para la llegada de la novia y la salida de los novios. Decoración floral opcional.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1570907870057-e1e338bc0665?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1561100966-f6aa0145e8e6?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1571113908007-5d6aae13d73e?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Auto clásico 3 horas', 'Auto clásico con chofer
Recorridos dentro de Quito', 280, 'por evento', null, null, 0),
    ('Auto clásico + decoración floral', 'Auto clásico 3 horas
Arreglo floral y lazos', 350, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-17', '2026-11-14', '2026-12-12', '2027-01-09', '2027-02-06', '2027-03-06', '2027-04-03', '2027-05-01', '2027-05-29', '2027-06-26']) as d;

-- Transporte: Elegance Autos Quito
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Elegance Autos Quito', 'Transporte', 'Quito y valles', '220', null, 'Sedanes y SUVs de lujo con chofer para novios, padrinos y familia. Puntualidad garantizada.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1592514313074-794923c98162?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1729022508881-866e115a51d8?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1698057917969-76564ba007e9?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Sedán de lujo 4 horas', 'Sedán ejecutivo con chofer
Agua y espumante', 220, 'por evento', null, null, 0),
    ('Caravana de 3 autos', 'Tres vehículos con chofer
4 horas de servicio', 560, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-17', '2026-11-14', '2026-12-12', '2027-01-09', '2027-02-06', '2027-03-06', '2027-04-03', '2027-05-01', '2027-05-29', '2027-06-26']) as d;

-- Transporte: Ruta Fiesta Transportes
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Ruta Fiesta Transportes', 'Transporte', 'Quito y valles', '150', null, 'Busetas y buses para llevar a los invitados desde Quito a la hacienda y de regreso, sin preocuparse por manejar después de la fiesta.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1523371696700-91e21249c0ed?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1655757457375-c1668c7bc0ad?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1516536900061-d881b27e8ff8?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Buseta de 25 pasajeros', 'Ida y vuelta dentro de 40 km
Chofer profesional', 180, 'por evento', null, 25, 0),
    ('Bus de 40 pasajeros', 'Ida y vuelta dentro de 40 km
Chofer profesional', 260, 'por evento', null, 40, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Wedding planner: Promesa Wedding Planners
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Promesa Wedding Planners', 'Wedding planner', 'Quito y valles', '900', null, 'Planificación integral de bodas: presupuesto, proveedores, cronograma y coordinación del día para que tú solo disfrutes.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1524824267900-2fa9cbf7a506?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1545396047-0fd21ce522ba?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Planificación integral', 'Acompañamiento de 8 a 12 meses
Selección y negociación de proveedores
Coordinación del día con 3 personas', 3500, 'por evento', null, null, 0),
    ('Coordinación del día', 'Reunión de traspaso un mes antes
Cronograma del día
Coordinadora y asistente', 900, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;

-- Wedding planner: Detalle & Co. Eventos
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Detalle & Co. Eventos', 'Wedding planner', 'Quito y valles', '750', null, 'Coordinación del último mes y del día de la boda para parejas que ya tienen sus proveedores y quieren llegar tranquilas.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1529651737248-dad5e287768e?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Coordinación del día', 'Cronograma y confirmación de proveedores
Coordinadora el día de la boda', 750, 'por evento', null, null, 0),
    ('Planificación parcial', 'Tres meses de acompañamiento
Tres proveedores recomendados
Coordinación del día', 1600, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Wedding planner: Altar Mayor Bodas de Destino
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Altar Mayor Bodas de Destino', 'Wedding planner', 'Quito y valles', '2200', null, 'Bodas de destino en Ecuador: Galápagos, Baños, Cotopaxi y la costa. Organizamos viaje, permisos, alojamiento de invitados y la boda completa.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1666305132656-097bd699e023?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1565038930214-09566ed2149b?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Elopement', 'Boda íntima para hasta 10 personas
Oficiante y fotógrafo
Un día de coordinación', 2200, 'por evento', null, 10, 0),
    ('Boda de destino integral', 'Planificación completa
Logística de invitados
Coordinación de 3 días', 5500, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-31', '2026-11-28', '2026-12-26', '2027-01-23', '2027-02-20', '2027-03-20', '2027-04-17', '2027-05-15', '2027-06-12']) as d;

-- Otro: Barra Andina Coctelería
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Barra Andina Coctelería', 'Otro', 'Quito y valles', '12', null, 'Bar móvil con bartenders y cócteles de autor con frutas ecuatorianas: maracuyá, naranjilla, mora y tomate de árbol.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1782677733438-2482d7fdde1a?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1620525429125-4790f36924cb?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1759646827349-bc2ac350d096?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Barra libre de cócteles', 'Cinco horas de barra
Cuatro cócteles de autor
Bartenders y cristalería', 16, 'por persona', 60, null, 0),
    ('Torre de champagne', 'Torre de 60 copas
Montaje y servicio para el brindis', 280, 'por evento', null, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Otro: Tinta Fina Papelería
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Tinta Fina Papelería', 'Otro', 'Quito y valles', '4', null, 'Invitaciones impresas, menús, tarjetas de mesa y plano de ubicación con un mismo diseño para todo tu evento.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1632610992723-82d7c212f6d7?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1633037773384-27d7ac0491e7?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1741893043659-ca8b82a8b637?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Invitación impresa con sobre', 'Diseño personalizado
Impresión en papel de algodón
Sobre con sello', 4, 'por persona', 50, null, 0),
    ('Papelería del día', 'Menús y tarjetas de mesa
Plano de ubicación
Letrero de bienvenida', 350, 'por evento', null, 200, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-24', '2026-11-21', '2026-12-19', '2027-01-16', '2027-02-13', '2027-03-13', '2027-04-10', '2027-05-08', '2027-06-05']) as d;

-- Otro: Recuerdo Vivo Detalles
with v as (
  insert into public.vendors (owner_id, business_name, category, city, price_from, capacity_max, description, status, is_demo)
  values (null, 'Recuerdo Vivo Detalles', 'Otro', 'Quito y valles', '3', null, 'Recuerdos personalizados para los invitados: chocolate ecuatoriano fino, mini botellas, velas y suculentas con etiqueta de los novios.', 'aprobado', true)
  returning id
), ph as (
  insert into public.vendor_photos (vendor_id, owner_id, path, position)
  select v.id, null, x.path, x.pos from v, (values
    ('https://images.unsplash.com/photo-1613067532743-33c628bc7e1d?auto=format&fit=crop&w=1600&q=80', 0),
    ('https://images.unsplash.com/photo-1738898179451-b5fc497f9f8e?auto=format&fit=crop&w=1600&q=80', 1),
    ('https://images.unsplash.com/photo-1633008460512-624a321c15b6?auto=format&fit=crop&w=1600&q=80', 2)
  ) as x(path, pos)
  returning 1
), pk as (
  insert into public.vendor_packages (vendor_id, owner_id, name, description, price, price_unit, min_guests, max_guests, position)
  select v.id, null, x.name, x.description, x.price::numeric, x.unit, x.min_g::int, x.max_g::int, x.pos from v, (values
    ('Chocolate fino personalizado', 'Barra de chocolate ecuatoriano
Empaque con nombres y fecha', 3, 'por persona', 50, null, 0),
    ('Kit de bienvenida', 'Bolsa de tela
Agua, snack y mapa del lugar
Tarjeta personalizada', 6, 'por persona', 30, null, 1)
  ) as x(name, description, price, unit, min_g, max_g, pos)
  returning 1
)
insert into public.vendor_availability (vendor_id, owner_id, day, status)
select v.id, null, d::date, 'ocupada' from v, unnest(array['2026-10-10', '2026-11-07', '2026-12-05', '2027-01-02', '2027-01-30', '2027-02-27', '2027-03-27', '2027-04-24', '2027-05-22', '2027-06-19']) as d;


-- 5) Comprobación: debe mostrar 12 categorías con 3 proveedores cada una
select category, count(*) as proveedores from public.vendors where is_demo group by category order by category;
