import { Link } from '@tanstack/react-router';
import { PageHeader } from '../components/PageHeader';
import { phases } from '../data/phases';

export function PhasesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="開發梯次藍圖 (Phases)"
        subtitle="八個梯次的開發藍圖，從內部 MVP 一路擴展至海量規模與 WebXR 虛擬商場。每個梯次包含核心目標、潛在風險、改進策略與完整任務清單。"
        badge={{ label: '開發梯次 Phases', className: 'badge-primary' }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {phases.map((p) => (
          <Link
            key={p.slug}
            to="/phases/$slug"
            params={{ slug: p.slug }}
            className="card card-hover block"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-1 font-mono text-sm text-primary">
                Phase {p.phase}
              </span>
              <span className="badge badge-purple">{p.backend.length} 後端</span>
              <span className="badge badge-primary">{p.frontend.length} 前端</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold">{p.title}</h2>
            <p className="mb-3 text-sm text-slate-400">{p.subtitle}</p>
            <p className="line-clamp-2 text-sm text-slate-300">{p.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
