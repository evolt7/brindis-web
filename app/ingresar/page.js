import Link from 'next/link';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';

export const metadata = { title: 'Ingresar' };

export default async function IngresarPage({ searchParams }) {
  const sp = (await searchParams) || {};
  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="auth-card auth-card-sm stack gap-24">
          <div className="stack gap-8">
            <h1 className="h2" style={{ fontSize: 36 }}>Ingresa a Brindis</h1>
            <p className="body">Con el correo y la clave de tu cuenta.</p>
          </div>
          <LoginForm linkError={sp.error === 'enlace'} />
          <p className="body" style={{ textAlign: 'center', fontSize: 15 }}>
            ¿No tienes cuenta? <Link href="/registro">Créala gratis</Link>
          </p>
        </div>
      </main>
    </>
  );
}
