import Link from 'next/link';
import Header from '@/components/Header';

export const metadata = { title: 'Crear cuenta' };

export default function RegistroPage() {
  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="stack gap-32">
          <div className="stack gap-12" style={{ textAlign: 'center', alignItems: 'center' }}>
            <span className="eyebrow">Crear cuenta</span>
            <h1 className="h2">¿Cómo quieres usar Brindis?</h1>
            <p className="body">Elige una opción. Es gratis y te toma dos minutos.</p>
          </div>
          <div className="choice-grid">
            <Link href="/registro/pareja" className="choice">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M12 13.5c-1.2-1.3-3-.4-3 1 0 1.6 3 3.5 3 3.5s3-1.9 3-3.5c0-1.4-1.8-2.3-3-1z" /></svg>
              <h2>Estoy organizando un evento</h2>
              <p className="body">Para parejas y familias que planean una boda, aniversario, quinceañera u otra celebración.</p>
              <span className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Crear cuenta de evento</span>
            </Link>
            <Link href="/registro/proveedor" className="choice">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10h16v10H4z" /><path d="M3 10l2-5h14l2 5" /><path d="M9 20v-5h6v5" /></svg>
              <h2>Tengo un negocio de eventos</h2>
              <p className="body">Para venues, catering, música, fotografía, decoración y todo proveedor que quiera más reservas.</p>
              <span className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Registrar mi negocio</span>
            </Link>
          </div>
          <p className="body" style={{ textAlign: 'center' }}>
            ¿Ya tienes cuenta? <Link href="/ingresar">Ingresa aquí</Link>
          </p>
        </div>
      </main>
    </>
  );
}
