import Link from 'next/link';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="auth-card auth-card-sm stack gap-16" style={{ textAlign: 'center', alignItems: 'center' }}>
          <h1 className="h2" style={{ fontSize: 34 }}>Esta página no existe</h1>
          <p className="body">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
          <Link href="/" className="btn btn-primary btn-sm">Volver al inicio</Link>
        </div>
      </main>
    </>
  );
}
