const BUCKET = 'vendor-photos';

export function photoUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path; // fotos externas (perfiles de ejemplo)
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const PHOTO_BUCKET = BUCKET;
export const MAX_PHOTOS = 12;
export const MAX_PACKAGES = 20;

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Fechas como texto 'AAAA-MM-DD', sin depender de la zona horaria.
export function isoDay(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function todayIso() {
  const d = new Date();
  return isoDay(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatLongDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const txt = date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `$${n.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Convierte el "precio desde" que escribe el proveedor (texto libre) en "$2.500" cuando es un número.
export function formatPriceFrom(raw) {
  if (raw === null || raw === undefined) return '';
  const txt = String(raw).trim();
  if (!txt) return '';
  const n = Number(txt.replace(/[$\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? formatPrice(n) : txt;
}
