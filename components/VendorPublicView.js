import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { CONTACT } from '@/lib/config';
import { photoUrl, formatPrice, formatLongDate } from '@/lib/vendor';
import AddToEventButton from '@/components/AddToEventButton';

function priceFrom(raw) {
  const txt = String(raw).trim();
  const n = Number(txt.replace(/[$\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) && txt !== '' ? formatPrice(n) : txt;
}

function socialLink(social) {
  if (!social) return null;
  const s = social.trim();
  if (s.startsWith('http')) return { href: s, label: s.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') };
  const handle = s.replace(/^@/, '').replace(/^instagram\.com\//, '');
  if (/^[A-Za-z0-9._]+$/.test(handle)) return { href: `https://instagram.com/${handle}`, label: `@${handle}` };
  return { href: null, label: s };
}

export default function VendorPublicView({ vendor, photos, packages, busy, isOwner, planner = { kind: 'anon' }, fecha = '' }) {
  const approved = vendor.status === 'aprobado';
  const social = socialLink(vendor.social);
  const eventDate = fecha || (planner.kind === 'pareja' && planner.event?.event_date) || '';
  const busyOnDate = eventDate ? busy.some((b) => b.day === eventDate) : false;
  const waText = encodeURIComponent(
    `Hola Brindis, me interesa ${vendor.business_name}. Mi evento es el ${eventDate ? formatLongDate(eventDate).toLowerCase() : '(fecha)'} para (número) invitados.`
  );
  const [cover, ...rest] = photos;
  const shownInGallery = rest.length < 4 ? Math.min(rest.length, 2) : 4;

  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 88 }}>
        <div className="stack gap-24">
          <Link href={fecha ? `/proveedores?fecha=${fecha}` : '/proveedores'} style={{ fontSize: 15, fontWeight: 600, alignSelf: 'flex-start' }}>‹ Ver más proveedores</Link>
          {vendor.is_demo && (
            <div className="alert" style={{ background: '#EEF1F7', color: '#2E3A59' }} role="status">
              <strong>Perfil de ejemplo.</strong> Este negocio no existe: lo creamos para mostrar cómo se ve un proveedor en Brindis. Los precios son referenciales del mercado en Quito.
            </div>
          )}
          {isOwner && !approved && (
            <div className="alert" style={{ background: '#FBEFD9', color: '#7A4B00' }} role="status">
              <strong>Vista previa.</strong> Así se verá tu página cuando aprobemos tu negocio. Por ahora solo tú puedes verla.{' '}
              <Link href="/panel">Volver a mi panel</Link>
            </div>
          )}

          {cover ? (
            <div className={`gallery ${rest.length === 0 ? 'gallery-single' : rest.length < 4 ? `gallery-compact${rest.length === 1 ? ' gallery-one' : ''}` : ''}`}>
              <img src={photoUrl(cover.path)} alt={`${vendor.business_name}, foto principal`} className="gallery-main" />
              {rest.slice(0, shownInGallery).map((p, i) => (
                <img key={p.id} src={photoUrl(p.path)} alt={`${vendor.business_name}, foto ${i + 2}`} loading="lazy" />
              ))}
            </div>
          ) : (
            <div className="card-soft" style={{ aspectRatio: '21 / 8', display: 'grid', placeItems: 'center' }}>
              <span className="hint">Este proveedor todavía no tiene fotos.</span>
            </div>
          )}

          <div className="public-grid">
            <div className="stack gap-32">
              <div className="stack gap-12">
                <span className="eyebrow">{[vendor.category, vendor.city].filter(Boolean).join(' · ')}</span>
                <h1 className="h2">{vendor.business_name}</h1>
                <div className="row-wrap gap-12">
                  {vendor.price_from && <span className="chip-sm">Desde {priceFrom(vendor.price_from)}</span>}
                  {vendor.capacity_max && <span className="chip-sm">Hasta {vendor.capacity_max} invitados</span>}
                  {social && (social.href ? (
                    <a className="chip-sm" href={social.href} target="_blank" rel="noopener noreferrer">{social.label}</a>
                  ) : (
                    <span className="chip-sm">{social.label}</span>
                  ))}
                </div>
                {vendor.description && <p className="lead" style={{ fontSize: 17, whiteSpace: 'pre-line' }}>{vendor.description}</p>}
              </div>

              {rest.length > shownInGallery && (
                <div className="stack gap-12">
                  <h2 className="h3">Más fotos</h2>
                  <div className="photo-grid">
                    {rest.slice(shownInGallery).map((p, i) => (
                      <figure key={p.id} className="photo-item"><img src={photoUrl(p.path)} alt={`${vendor.business_name}, foto ${i + shownInGallery + 2}`} loading="lazy" /></figure>
                    ))}
                  </div>
                </div>
              )}

              {packages.length > 0 && (
                <div className="stack gap-16">
                  <h2 className="h3" style={{ fontSize: 24 }}>Paquetes y precios</h2>
                  {packages.map((p) => (
                    <div key={p.id} className="card stack gap-8">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--wine)' }}>
                          {p.price !== null ? `${formatPrice(p.price)} ${p.price_unit}` : 'A consultar'}
                        </span>
                      </div>
                      {(p.min_guests || p.max_guests) && (
                        <span className="hint">
                          {p.min_guests ? `Desde ${p.min_guests}` : ''}{p.min_guests && p.max_guests ? ' y ' : ''}{p.max_guests ? `${p.min_guests ? 'hasta' : 'Hasta'} ${p.max_guests}` : ''} invitados
                        </span>
                      )}
                      {p.description && <p className="body" style={{ whiteSpace: 'pre-line', fontSize: 15 }}>{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              <div className="stack gap-16">
                <h2 className="h3" style={{ fontSize: 24 }}>Disponibilidad</h2>
                <div className="card">
                  <AvailabilityCalendar vendorId={vendor.id} initialBusy={busy} editable={false} months={2} maxAhead={18} initialCheck={eventDate} />
                </div>
              </div>
            </div>

            {vendor.is_demo ? (
              <aside className="cta-card">
                <span className="badge badge-demo" style={{ alignSelf: 'flex-start' }}>Perfil de ejemplo</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600 }}>¿Tienes un negocio así?</span>
                <p className="body" style={{ fontSize: 15 }}>
                  Así se vería tu negocio en Brindis: fotos, paquetes con precio y tu calendario de fechas libres. El registro es gratis.
                </p>
                <Link href="/registro/proveedor" className="btn btn-primary btn-block">Registrar mi negocio</Link>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hola Brindis, busco opciones de ${(vendor.category || 'proveedores').toLowerCase()} para mi evento.`)}`}
                  className="btn btn-outline btn-block btn-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Busco opciones como esta
                </a>
              </aside>
            ) : (
              <aside className="cta-card">
                <span style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600 }}>¿Te gusta para tu evento?</span>
                {eventDate && (
                  <span className={`badge ${busyOnDate ? 'badge-wine' : 'badge-ok'}`} style={{ alignSelf: 'flex-start' }}>
                    {busyOnDate ? 'Ocupado' : 'Libre'} el {formatLongDate(eventDate).toLowerCase()}
                  </span>
                )}
                {!isOwner && planner.kind !== 'vendor' && approved && (
                  <AddToEventButton vendorId={vendor.id} planner={planner} returnTo={`/proveedores/${vendor.id}${fecha ? `?fecha=${fecha}` : ''}`} size="md" block />
                )}
                <p className="body" style={{ fontSize: 15 }}>
                  Cuéntanos tu fecha y número de invitados. Confirmamos la disponibilidad y te enviamos la cotización por WhatsApp.
                </p>
                <a href={`https://wa.me/${CONTACT.whatsapp}?text=${waText}`} className="btn btn-outline btn-block btn-sm" target="_blank" rel="noopener noreferrer">
                  Pedir cotización por WhatsApp
                </a>
                {planner.kind === 'anon' && (
                  <span className="hint" style={{ textAlign: 'center' }}>
                    ¿No tienes cuenta? <Link href="/registro/pareja">Créala gratis</Link> y guarda proveedores en tu evento.
                  </span>
                )}
                {planner.kind === 'pareja' && (
                  <Link href="/panel" className="hint" style={{ textAlign: 'center' }}>Ver mi evento</Link>
                )}
              </aside>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
