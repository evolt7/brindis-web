import Link from 'next/link';
import { CONTACT } from '@/lib/config';
import { photoUrl } from '@/lib/vendor';
import VendorTabs from '@/components/VendorTabs';

function formatDate(iso) {
  if (!iso) return 'Por definir';
  const d = new Date(`${iso}T12:00:00Z`);
  const txt = d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(`${iso}T12:00:00Z`).getTime();
  const diff = Math.ceil((target - Date.now()) / 86400000);
  return diff > 0 ? diff : null;
}

const vendorChecklist = ['Venue o hacienda', 'Catering', 'Música y DJ', 'Fotografía y video', 'Flores y decoración', 'Pastel y dulces'];

export function ParejaPanel({ profile, event }) {
  const days = daysUntil(event?.event_date);
  const firstName = (profile.full_name || '').split(' ')[0] || 'hola';
  return (
    <div className="stack gap-32">
      <div className="stack gap-8">
        <span className="eyebrow">Tu evento</span>
        <h1 className="h2">¡Hola, {firstName}! Empecemos a armar tu celebración.</h1>
        {days && <p className="lead">Faltan {days} días para tu evento.</p>}
      </div>

      <div className="panel-grid">
        <div className="card stack gap-20">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <h2 className="h3">{event?.event_type || 'Tu evento'}</h2>
            <span className="badge badge-wine">En planificación</span>
          </div>
          <dl className="kv" style={{ margin: 0 }}>
            <div><dt>Fecha</dt><dd>{formatDate(event?.event_date)}</dd></div>
            <div><dt>Ciudad</dt><dd>{event?.city || 'Por definir'}</dd></div>
            <div><dt>Invitados</dt><dd>{event?.guests || 'Por definir'}</dd></div>
            <div><dt>Presupuesto</dt><dd>{event?.budget || 'Por definir'}</dd></div>
          </dl>
          <div className="divider" />
          <h3 className="h3" style={{ fontSize: 17 }}>Tus proveedores</h3>
          <div className="stack gap-12">
            {vendorChecklist.map((c) => (
              <div className="vendor-row" key={c}>
                <span className="vendor-name">{c}</span>
                <span className="badge badge-wine">Por elegir</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stack gap-16">
          <div className="promo promo-blush" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 24 }}>Qué sigue</h3>
            <ol className="steps">
              <li>Revisamos qué proveedores están libres para tu fecha.</li>
              <li>Te escribimos por WhatsApp con opciones y precios.</li>
              <li>Eliges, reservas y lo verás aquí en tu tablero.</li>
            </ol>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hola Brindis, acabo de crear mi cuenta y quiero ver proveedores para mi evento.')}`}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp
            </a>
          </div>
          <div className="card stack gap-8">
            <span style={{ fontWeight: 700 }}>Muy pronto en tu panel</span>
            <span className="body" style={{ fontSize: 15 }}>
              Catálogo con disponibilidad por fecha, presupuesto, lista de invitados y mapa de mesas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProveedorPanel({ profile, vendor, stats = {} }) {
  const firstName = (profile.full_name || '').split(' ')[0] || 'hola';
  const approved = vendor?.status === 'aprobado';
  const profileDone = Boolean(vendor?.description && vendor.description.length >= 40 && vendor?.price_from);
  const steps = [
    { done: profileDone, label: 'Completa tu perfil', detail: 'Descripción y precio desde.', href: '/panel/perfil' },
    { done: (stats.photos || 0) >= 5, label: 'Sube al menos 5 fotos', detail: `${stats.photos || 0} de 12 fotos.`, href: '/panel/fotos' },
    { done: (stats.packages || 0) >= 1, label: 'Agrega tus paquetes con precio', detail: `${stats.packages || 0} paquetes.`, href: '/panel/paquetes' },
    { done: (stats.busyDays || 0) >= 1, label: 'Marca tus fechas ocupadas', detail: `${stats.busyDays || 0} fechas ocupadas desde hoy.`, href: '/panel/calendario' },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="stack gap-24">
      <div className="stack gap-8">
        <span className="eyebrow">Tu negocio</span>
        <h1 className="h2">¡Hola, {firstName}! Armemos tu perfil en Brindis.</h1>
        <p className="lead" style={{ fontSize: 17 }}>
          {approved
            ? 'Tu perfil está publicado. Mantén tus fechas al día para recibir solicitudes reales.'
            : 'Mientras revisamos tu negocio, deja listo tu perfil: así lo publicamos apenas lo aprobemos.'}
        </p>
      </div>
      <VendorTabs />

      <div className="panel-grid">
        <div className="card stack gap-20">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 className="h3">Tu perfil: {doneCount} de {steps.length} pasos</h2>
            <span className={`badge ${approved ? 'badge-ok' : 'badge-wait'}`}>{approved ? 'Publicado' : 'En revisión'}</span>
          </div>
          <div className="progress" aria-hidden="true"><span style={{ width: `${(doneCount / steps.length) * 100}%` }} /></div>
          <ul className="checklist">
            {steps.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className={`check-item${s.done ? ' check-done' : ''}`}>
                  <span className="check-mark" aria-hidden="true">
                    {s.done ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                    ) : null}
                  </span>
                  <span className="stack" style={{ gap: 2, flexGrow: 1 }}>
                    <span style={{ fontWeight: 700 }}>{s.label}</span>
                    <span className="hint">{s.detail}</span>
                  </span>
                  <span className="sr-only">{s.done ? 'Listo' : 'Pendiente'}</span>
                  <span aria-hidden="true" style={{ color: 'var(--wine)', fontWeight: 700 }}>›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="stack gap-16">
          <div className="card stack gap-12" style={{ padding: 0, overflow: 'hidden' }}>
            {stats.cover ? (
              <img src={photoUrl(stats.cover)} alt="Portada de tu negocio" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ aspectRatio: '16 / 10', background: 'var(--blush)', display: 'grid', placeItems: 'center' }}>
                <span className="hint">Aquí irá tu foto de portada</span>
              </div>
            )}
            <div className="stack gap-8" style={{ padding: '4px 24px 24px' }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{vendor?.business_name || 'Tu negocio'}</span>
              <span className="hint">{[vendor?.category, vendor?.city].filter(Boolean).join(' · ')}</span>
              {vendor && (
                <Link href={`/proveedores/${vendor.id}`} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  {approved ? 'Ver mi página pública' : 'Vista previa de mi página'}
                </Link>
              )}
            </div>
          </div>
          <div className="promo promo-blush" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 22 }}>¿Necesitas ayuda?</h3>
            <p className="body" style={{ fontSize: 15 }}>Te ayudamos a armar tu perfil y a elegir tus mejores fotos.</p>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hola Brindis, soy de ${vendor?.business_name || 'un negocio registrado'} y quiero ayuda con mi perfil.`)}`}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
