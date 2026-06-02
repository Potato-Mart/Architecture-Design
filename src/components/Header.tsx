import { useState } from 'react';
import { Link } from '@tanstack/react-router';

const navLinks = [
  { to: '/', label: '總覽 Overview', exact: true },
  { to: '/architecture', label: '全景架構 Architecture' },
  { to: '/phases', label: '開發梯次 Phases' },
  { to: '/tickets', label: '任務 Tickets' },
  { to: '/about', label: '關於 About' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="土豆商城" className="h-9 w-9 rounded-lg object-contain" />
          <span className="text-lg font-bold brand-text">土豆商城 Potato Mart</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.exact }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white [&.active]:bg-white/10 [&.active]:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-ink/95 px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.exact }}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 [&.active]:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
