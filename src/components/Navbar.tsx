'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/colleges', label: 'Colleges' },
  { href: '/compare', label: 'Compare' },
  { href: '/predictor', label: 'Predictor' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className="navbar" style={{
      background: scrolled
        ? 'rgba(7, 8, 15, 0.92)'
        : 'rgba(7, 8, 15, 0.6)',
    }}>
      <Link href="/" className="navbar-logo">
        🎓 EduFind
      </Link>

      <div className="navbar-links">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`navbar-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/predictor" className="navbar-cta">
          Predict My College ✨
        </Link>
      </div>
    </nav>
  );
}
