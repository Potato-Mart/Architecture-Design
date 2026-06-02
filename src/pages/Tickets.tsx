import { useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { TicketCard } from '../components/TicketCard';
import { tickets } from '../data/tickets';
import { phases } from '../data/phases';

type CategoryFilter = 'all' | 'backend' | 'frontend';

export function TicketsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [phase, setPhase] = useState<number | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (phase !== 'all' && t.phase !== phase) return false;
      if (q) {
        const haystack = `${t.id} ${t.title} ${t.tag} ${t.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [query, category, phase]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="任務 Backlog Tickets"
        subtitle={`全部 ${tickets.length} 個可執行任務，涵蓋八個開發梯次的後端與前端工程。每個任務皆附有具體的驗收標準。`}
        badge={{ label: '任務 Tickets', className: 'badge-purple' }}
      />

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋任務 ID、標題或內容…"
          className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary lg:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {(['all', 'backend', 'frontend'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                category === c
                  ? 'bg-brand-gradient text-ink'
                  : 'border border-white/15 text-slate-300 hover:bg-white/5'
              }`}
            >
              {c === 'all' ? '全部' : c === 'backend' ? '後端' : '前端'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPhase('all')}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            phase === 'all' ? 'bg-white/10 text-primary' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          所有梯次
        </button>
        {phases.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setPhase(p.phase)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              phase === p.phase ? 'bg-white/10 text-primary' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Phase {p.phase}
          </button>
        ))}
      </div>

      <p className="mb-6 text-sm text-slate-400">符合條件：{filtered.length} 個任務</p>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      ) : (
        <div className="card text-center text-slate-400">找不到符合條件的任務。</div>
      )}
    </div>
  );
}
