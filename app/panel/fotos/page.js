import VendorShell from '@/components/VendorShell';
import PhotoManager from '@/components/PhotoManager';
import { getPanelContext } from '@/lib/panel';

export const metadata = { title: 'Fotos de mi negocio' };
export const dynamic = 'force-dynamic';

export default async function FotosPage() {
  const { supabase, user, profile, vendor } = await getPanelContext({ requireVendor: true });
  const { data: photos } = await supabase
    .from('vendor_photos')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('position', { ascending: true });

  return (
    <VendorShell
      name={profile.full_name || user.email}
      businessName={vendor.business_name}
      title="Fotos"
      intro="Sube hasta 12 fotos de tu trabajo. Las comprimimos automáticamente para que tu página cargue rápido."
    >
      <PhotoManager vendorId={vendor.id} ownerId={user.id} initialPhotos={photos || []} />
    </VendorShell>
  );
}
