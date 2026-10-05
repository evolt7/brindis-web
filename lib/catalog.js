import { createClient } from '@/lib/supabase/server';
import { CITIES, VENDOR_CATEGORIES, GUEST_RANGES } from '@/lib/config';

// Rango de invitados elegido en los formularios -> número mínimo que el proveedor debe poder atender.
export const GUEST_RANGE_TO_NUMBER = {
  'Menos de 50': 50,
  '50 a 100': 100,
  '100 a 150': 150,
  '150 a 250': 250,
  'Más de 250': 300,
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

// Lee y limpia los filtros que vienen en la dirección (?categoria=…&fecha=…).
export function parseFilters(sp = {}, defaults = {}) {
  const pick = (k) => (typeof sp[k] === 'string' ? sp[k].trim() : '');
  const categoria = VENDOR_CATEGORIES.includes(pick('categoria')) ? pick('categoria') : '';
  const ciudadRaw = pick('ciudad') || defaults.ciudad || '';
  const ciudad = CITIES.includes(ciudadRaw) ? ciudadRaw : '';
  const fechaRaw = pick('fecha') || defaults.fecha || '';
  const fecha = ISO.test(fechaRaw) ? fechaRaw : '';
  const invRaw = pick('invitados') || defaults.invitados || '';
  const invitados = GUEST_RANGES.includes(invRaw) ? invRaw : '';
  return { categoria, ciudad, fecha, invitados };
}

// Busca proveedores aprobados que cumplen los filtros. Si hay fecha, quita a los ocupados ese día.
export async function searchVendors({ categoria, ciudad, fecha, invitados }, limit = 60) {
  const supabase = await createClient();
  let q = supabase
    .from('vendors')
    .select('*')
    .eq('status', 'aprobado')
    .order('created_at', { ascending: true })
    .limit(limit * 2);
  if (categoria) q = q.eq('category', categoria);
  if (ciudad) q = q.eq('city', ciudad);
  const minCap = GUEST_RANGE_TO_NUMBER[invitados];
  if (minCap) q = q.or(`capacity_max.is.null,capacity_max.gte.${minCap}`);
  const { data: vendors, error } = await q;
  if (error || !vendors?.length) return { vendors: [], busyCount: 0, error };

  const ids = vendors.map((v) => v.id);
  const [{ data: photos }, busyRes] = await Promise.all([
    supabase.from('vendor_photos').select('vendor_id,path,position').in('vendor_id', ids).order('position', { ascending: true }),
    fecha ? supabase.from('vendor_availability').select('vendor_id').in('vendor_id', ids).eq('day', fecha) : Promise.resolve({ data: [] }),
  ]);

  const covers = new Map();
  for (const p of photos || []) if (!covers.has(p.vendor_id)) covers.set(p.vendor_id, p.path);
  const busy = new Set((busyRes.data || []).map((r) => r.vendor_id));

  // Proveedores reales primero; los perfiles de ejemplo al final.
  const free = vendors
    .filter((v) => !busy.has(v.id))
    .map((v) => ({ ...v, cover: covers.get(v.id) || null }))
    .sort((a, b) => Number(Boolean(a.is_demo)) - Number(Boolean(b.is_demo)));
  return { vendors: free, busyCount: busy.size, error: null };
}

// Para una pareja conectada: su evento y los proveedores que ya guardó.
export async function getPlannerContext() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { kind: 'anon' };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: 'anon' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role === 'proveedor') return { kind: 'vendor', userId: user.id };
  const { data: events } = await supabase
    .from('events')
    .select('id,event_type,event_date,city,guests')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1);
  const event = events?.[0] || null;
  let saved = [];
  if (event) {
    const { data } = await supabase.from('event_vendors').select('vendor_id').eq('event_id', event.id);
    saved = (data || []).map((r) => r.vendor_id);
  }
  return { kind: 'pareja', userId: user.id, event, saved };
}
