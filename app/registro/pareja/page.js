import Link from 'next/link';
import Header from '@/components/Header';
import SignupPareja from '@/components/SignupPareja';

export const metadata = { title: 'Crea tu cuenta' };

export default async function RegistroParejaPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const pick = (k) => (typeof sp[k] === 'string' ? sp[k] : '');
  const initial = { tipo: pick('tipo'), fecha: pick('fecha'), ciudad: pick('ciudad'), invitados: pick('invitados') };

  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="auth-card stack gap-24">
          <div className="stack gap-8">
            <span className="eyebrow">Gratis para parejas y familias</span>
            <h1 className="h2" style={{ fontSize: 36 }}>Crea tu cuenta</h1>
            <p className="body">Cuéntanos de tu evento y te mostraremos los proveedores disponibles para tu fecha.</p>
          </div>
          <SignupPareja initial={initial} />
          <p className="body" style={{ textAlign: 'center', fontSize: 15 }}>
            ¿Ya tienes cuenta? <Link href="/ingresar">Ingresa</Link> · ¿Eres proveedor? <Link href="/registro/proveedor">Regístrate aquí</Link>
          </p>
        </div>
      </main>
    </>
  );
}
