import VendorShell from '@/components/VendorShell';
import PackageManager from '@/components/PackageManager';
import { getPanelContext } from '@/lib/panel';

export const metadata = { title: 'Paquetes y precios' };
export const dynamic = 'force-dynamic';

export default async function PaquetesPage() {
  const { supabase, user, profile, vendor } = await getPanelContext({ requireVendor: true });
  const { data: packages } = await supabase
    .from('vendor_packages')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('position', { ascending: true });

  return (
    <VendorShell
      name={profile.full_name || user.email}
      businessName={vendor.business_name}
      title="Paquetes y precios"
      intro="Describe tus servicios con precio. Las parejas comparan mejor y te escriben con una idea clara de lo que quieren."
    >
      <PackageManager vendorId={vendor.id} initialPackages={packages || []} />
    </VendorShell>
  );
}
