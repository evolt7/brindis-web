'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/panel', label: 'Resumen' },
  { href: '/panel/perfil', label: 'Perfil' },
  { href: '/panel/fotos', label: 'Fotos' },
  { href: '/panel/paquetes', label: 'Paquetes' },
  { href: '/panel/calendario', label: 'Calendario' },
];

export default function VendorTabs() {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Secciones de tu negocio">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} className={`tab${active ? ' tab-active' : ''}`} aria-current={active ? 'page' : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
