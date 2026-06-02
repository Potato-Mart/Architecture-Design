import { Link, useParams } from '@tanstack/react-router';
import { tickets } from '../data/tickets';
import { categoryBadge } from '../components/TicketCard';

export function TicketDetailPage() {
  const { id } = useParams({ from: '/tickets/$id' });
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">找不到此任務</h1>
        <Link to="/tickets" className="mt-4 inline-block text-primary hover:underline">
          ← 返回任務列表
        </Link>
      </div>
    );
  }

  const cat = categoryBadge(ticket.category);
  const idx = tickets.findIndex((t) => t.id === id);
  const prev = idx > 0 ? tickets[idx - 1] : null;
  const next = idx < tickets.length - 1 ? tickets[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link to="/tickets" className="mb-8 inline-block text-sm text-slate-400 hover:text-primary">
        ← 返回任務列表
      </Link>

      <article className="card">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-1 font-mono text-sm text-primary">
            [{ticket.id}]
          </span>
          <span className={`badge ${cat.className}`}>{cat.label}</span>
          <Link to="/phases/$slug" params={{ slug: `phase-${ticket.phase}` }}>
            <span className="badge badge-success hover:opacity-80">第 {ticket.phase} 梯次</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold sm:text-3xl">{ticket.title}</h1>
        {ticket.tag && <p className="mt-3 text-primary">{ticket.tag}</p>}

        <p className="mt-6 text-slate-300">{ticket.description}</p>

        {ticket.acceptance.length > 0 && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              驗收標準 (Acceptance Criteria)
            </h2>
            <ul className="bullet-list">
              {ticket.acceptance.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-4 text-sm text-slate-400">
          所屬梯次：
          <Link
            to="/phases/$slug"
            params={{ slug: `phase-${ticket.phase}` }}
            className="text-primary hover:underline"
          >
            {ticket.phaseTitle}
          </Link>
        </div>
      </article>

      <nav className="mt-8 flex items-center justify-between text-sm">
        {prev ? (
          <Link to="/tickets/$id" params={{ id: prev.id }} className="text-slate-300 hover:text-primary">
            ← [{prev.id}]
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/tickets/$id" params={{ id: next.id }} className="text-slate-300 hover:text-primary">
            [{next.id}] →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
