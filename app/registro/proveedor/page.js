import Link from 'next/link';
import Header from '@/components/Header';
import SignupProveedor from '@/components/SignupProveedor';

export const metadata = { title: 'Registra tu negocio' };

export default function RegistroProveedorPage() {
  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="auth-card stack gap-24">
          <div className="stack gap-8">
            <span className="eyebrow">Para proveedores</span>
            <h1 className="h2" style={{ fontSize: 36 }}>Registra tu negocio</h1>
            <p className="body">
              Tu perfil es gratis. Revisamos cada negocio antes de publicarlo y te contactamos por WhatsApp para completar tu perfil.
            </p>
          </div>
          <SignupProveedor />
          <p className="body" style={{ textAlign: 'center', fontSize: 15 }}>
            ¿Ya tienes cuenta? <Link href="/ingresar">Ingresa</Link> · ¿Organizas un evento? <Link href="/registro/pareja">Regístrate aquí</Link>
          </p>
        </div>
      </main>
    </>
  );
}
