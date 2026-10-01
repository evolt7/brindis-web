import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Carga al usuario conectado, su perfil y (si es proveedor) su negocio.
// Redirige a /ingresar si no hay sesión y a /panel si la página es solo para proveedores.
export async function getPanelContext({ requireVendor = false } = {}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect('/ingresar');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const safeProfile = profile || {
    id: user.id,
    full_name: user.user_metadata?.full_name || '',
    role: user.user_metadata?.role || 'pareja',
  };

  let vendor = null;
  if (safeProfile.role === 'proveedor') {
    const { data } = await supabase.from('vendors').select('*').eq('owner_id', user.id).maybeSingle();
    vendor = data;
  }
  if (requireVendor && !vendor) redirect('/panel');

  return { supabase, user, profile: safeProfile, vendor };
}
