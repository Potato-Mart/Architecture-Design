import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
      <span className="badge badge-danger mb-4">404</span>
      <h1 className="text-4xl font-bold">找不到頁面</h1>
      <p className="mt-3 text-slate-400">您要找的頁面不存在或已被移動。</p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-ink transition hover:opacity-90"
      >
        返回首頁
      </Link>
    </div>
  );
}
