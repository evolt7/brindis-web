import Link from 'next/link';
import Header from '@/components/Header';

export const metadata = { title: 'Confirma tu correo' };

export default function RevisaTuCorreoPage() {
  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="auth-card auth-card-sm stack gap-20" style={{ textAlign: 'center', alignItems: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
          <h1 className="h2" style={{ fontSize: 34 }}>Revisa tu correo</h1>
          <p className="body">
            Te enviamos un enlace para confirmar tu cuenta. Ábrelo desde el mismo dispositivo y entrarás directo a tu panel.
          </p>
          <p className="hint">¿No te llegó? Revisa la carpeta de spam o promociones; puede tardar unos minutos.</p>
          <Link href="/ingresar" className="btn btn-outline btn-sm">Ir a ingresar</Link>
        </div>
      </main>
    </>
  );
}
