import Link from 'next/link';
import AddToEventButton from '@/components/AddToEventButton';
import { photoUrl, formatPriceFrom as priceFrom } from '@/lib/vendor';

export default function VendorCard({ vendor, planner, fecha, returnTo }) {
  const href = `/proveedores/${vendor.id}${fecha ? `?fecha=${fecha}` : ''}`;
  return (
    <article className="vendor-card">
      <Link href={href} className="vendor-card-media" aria-label={`Ver ${vendor.business_name}`}>
        {vendor.cover ? (
          <img src={photoUrl(vendor.cover)} alt="" loading="lazy" />
        ) : (
          <span className="vendor-card-placeholder">Sin fotos todavía</span>
        )}
        {fecha && <span className="badge badge-ok vendor-card-badge">Libre en tu fecha</span>}
        {vendor.is_demo && <span className="badge badge-demo vendor-card-demo">Perfil de ejemplo</span>}
      </Link>
      <div className="vendor-card-body">
        <span className="vendor-cat">{[vendor.category, vendor.city].filter(Boolean).join(' · ')}</span>
        <h3 className="vendor-card-title">
          <Link href={href}>{vendor.business_name}</Link>
        </h3>
        <div className="row-wrap gap-8" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          {vendor.price_from && <span>Desde <strong style={{ color: 'var(--ink)' }}>{priceFrom(vendor.price_from)}</strong></span>}
          {vendor.price_from && vendor.capacity_max && <span aria-hidden="true">·</span>}
          {vendor.capacity_max && <span>Hasta {vendor.capacity_max} invitados</span>}
        </div>
        <div className="vendor-card-actions">
          {!vendor.is_demo && <AddToEventButton vendorId={vendor.id} planner={planner} returnTo={returnTo} />}
          <Link href={href} className="btn btn-outline btn-sm">Ver perfil</Link>
        </div>
      </div>
    </article>
  );
}
