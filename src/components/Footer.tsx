import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-ink/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="土豆商城" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <p className="font-semibold brand-text">土豆商城 Potato Mart</p>
              <p className="text-sm text-slate-400">極致降成本雲端架構藍圖</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            <Link to="/architecture" className="hover:text-primary">全景架構</Link>
            <Link to="/phases" className="hover:text-primary">開發梯次</Link>
            <Link to="/tickets" className="hover:text-primary">任務 Tickets</Link>
            <Link to="/about" className="hover:text-primary">關於</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} 土豆商城 Potato Mart.
        </p>
      </div>
    </footer>
  );
}
