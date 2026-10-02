import CatalogView from '@/components/CatalogView';
import { parseFilters, searchVendors, getPlannerContext } from '@/lib/catalog';

export const metadata = {
  title: 'Proveedores para tu evento',
  description: 'Venues, catering, música, fotografía y más en Quito. Elige tu fecha y mira solo los proveedores disponibles.',
};
export const dynamic = 'force-dynamic';

export default async function CatalogPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const planner = await getPlannerContext();

  // Si una pareja entra sin filtros, usamos los datos de su evento.
  const noParams = Object.keys(sp).length === 0;
  const today = new Date().toISOString().slice(0, 10);
  const ev = planner.kind === 'pareja' ? planner.event : null;
  const defaults =
    noParams && ev
      ? { fecha: ev.event_date && ev.event_date >= today ? ev.event_date : '', ciudad: ev.city || '', invitados: ev.guests || '' }
      : {};
  const filters = parseFilters(sp, defaults);
  const usedEventDefaults = noParams && Boolean(defaults.fecha || defaults.ciudad || defaults.invitados);

  const { vendors, busyCount } = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? await searchVendors(filters)
    : { vendors: [], busyCount: 0 };

  return (
    <CatalogView
      filters={filters}
      vendors={vendors}
      busyCount={busyCount}
      planner={planner}
      usedEventDefaults={usedEventDefaults}
    />
  );
}
