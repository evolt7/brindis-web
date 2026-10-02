import { notFound } from 'next/navigation';
import VendorPublicView from '@/components/VendorPublicView';
import { createClient } from '@/lib/supabase/server';
import { photoUrl } from '@/lib/vendor';
import { getPlannerContext } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadVendor(id) {
  if (!UUID.test(id) || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createClient();
  const { data: vendor } = await supabase.from('vendors').select('*').eq('id', id).maybeSingle();
  if (!vendor) return null;
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const [{ data: photos }, { data: packages }, { data: busy }, { data: auth }] = await Promise.all([
    supabase.from('vendor_photos').select('id,path').eq('vendor_id', id).order('position', { ascending: true }),
    supabase.from('vendor_packages').select('*').eq('vendor_id', id).order('position', { ascending: true }),
    supabase.from('vendor_availability').select('day,status').eq('vendor_id', id).gte('day', firstOfMonth.toISOString().slice(0, 10)).limit(1000),
    supabase.auth.getUser(),
  ]);
  return { vendor, photos: photos || [], packages: packages || [], busy: busy || [], isOwner: auth?.user?.id === vendor.owner_id };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await loadVendor(id);
  if (!data) return { title: 'Proveedor no encontrado' };
  const { vendor, photos } = data;
  const description = (vendor.description || `${vendor.category || 'Proveedor de eventos'} en ${vendor.city || 'Ecuador'}`).slice(0, 160);
  return {
    title: vendor.business_name,
    description,
    openGraph: { title: `${vendor.business_name} · Brindis`, description, images: photos[0] ? [photoUrl(photos[0].path)] : [] },
  };
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default async function ProveedorPublicPage({ params, searchParams }) {
  const { id } = await params;
  const sp = (await searchParams) || {};
  const [data, planner] = await Promise.all([loadVendor(id), getPlannerContext()]);
  if (!data) notFound();
  const fecha = typeof sp.fecha === 'string' && ISO.test(sp.fecha) ? sp.fecha : '';
  return <VendorPublicView {...data} planner={planner} fecha={fecha} />;
}
