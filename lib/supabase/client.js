import { createBrowserClient } from '@supabase/ssr';

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function siteUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

// Traduce los errores más comunes de Supabase a mensajes claros en español.
export function friendlyError(error) {
  const msg = (error && error.message ? error.message : '').toLowerCase();
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'Ya existe una cuenta con este correo. Ingresa o recupera tu clave.';
  }
  if (msg.includes('invalid login credentials')) return 'El correo o la clave no son correctos.';
  if (msg.includes('email not confirmed')) {
    return 'Todavía no confirmas tu correo. Revisa tu bandeja de entrada (y la carpeta de spam).';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Hubo demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.';
  }
  if (msg.includes('password') && (msg.includes('least') || msg.includes('weak') || msg.includes('short'))) {
    return 'La clave es muy débil. Usa al menos 8 caracteres, con letras y números.';
  }
  if (msg.includes('invalid') && msg.includes('email')) return 'Revisa que el correo esté bien escrito.';
  if (msg.includes('network') || msg.includes('fetch')) return 'No pudimos conectarnos. Revisa tu internet e inténtalo otra vez.';
  return 'Algo salió mal. Inténtalo otra vez en unos minutos.';
}
