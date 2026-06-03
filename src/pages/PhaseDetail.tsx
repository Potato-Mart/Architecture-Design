import { Link, useParams } from '@tanstack/react-router';
import { PageHeader } from '../components/PageHeader';
import { phases } from '../data/phases';
import { useTicketsQuery } from '../api/tickets';
import type { Ticket } from '../types/ticket';

function TicketItem({ ticket }: { ticket: Ticket }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5 transition hover:border-primary">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Link
          to="/tickets/$id"
          params={{ id: ticket.id }}
          className="rounded bg-primary/10 px-2 py-1 font-mono text-sm text-primary hover:underline"
        >
          [{ticket.id}]
        </Link>
        <span className="font-semibold">{ticket.title}</span>
      </div>
      {ticket.tag && <span className="badge badge-warning mb-2">{ticket.tag}</span>}
      <p className="mt-1 text-sm text-slate-300">{ticket.description}</p>
      {ticket.acceptance.length > 0 && (
        <div className="mt-3 border-t border-dashed border-white/10 pt-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
            驗收標準 (Acceptance Criteria)
          </div>
          <ul className="bullet-list text-sm">
            {ticket.acceptance.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PhaseDetailPage() {
  const { slug } = useParams({ from: '/phases/$slug' });
  const phase = phases.find((p) => p.slug === slug);
  const { data: tickets = [], isError, isLoading } = useTicketsQuery();

  if (!phase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">找不到此梯次</h1>
        <Link to="/phases" className="mt-4 inline-block text-primary hover:underline">
          ← 返回開發梯次
        </Link>
      </div>
    );
  }

  const idx = phases.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? phases[idx - 1] : null;
  const next = idx < phases.length - 1 ? phases[idx + 1] : null;
  const backendTickets = tickets.filter(
    (ticket) => ticket.phase === phase.phase && ticket.category === 'backend',
  );
  const frontendTickets = tickets.filter(
    (ticket) => ticket.phase === phase.phase && ticket.category === 'frontend',
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Phase nav strip */}
      <nav className="mb-8 flex flex-wrap gap-2">
        {phases.map((p) => (
          <Link
            key={p.slug}
            to="/phases/$slug"
            params={{ slug: p.slug }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              p.slug === slug
                ? 'bg-brand-gradient text-ink'
                : 'border border-white/15 text-slate-300 hover:bg-white/5'
            }`}
          >
            Phase {p.phase}
          </Link>
        ))}
      </nav>

      <PageHeader
        title={phase.title}
        subtitle={phase.subtitle}
        badge={{ label: `第 ${phase.phase} 梯次`, className: 'badge-success' }}
      />

      {/* Goals / Risks / Improvements */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="badge badge-success">階段任務</span> 核心目標與範圍
          </h2>
          {phase.intro && <p className="mb-3 text-slate-300">{phase.intro}</p>}
          <ul className="bullet-list">
            {phase.goals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="badge badge-danger">潛在風險</span>
          </h2>
          <ul className="bullet-list">
            {phase.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <span className="badge badge-primary">修復與改進</span>
          </h2>
          <ul className="bullet-list">
            {phase.improvements.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Backend tickets */}
      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <span className="badge badge-purple">後端工程</span> Backend Backlog Tickets
        </h2>
        {isLoading ? (
          <div className="card text-center text-slate-400">Loading backend tickets from the API...</div>
        ) : isError ? (
          <div className="card text-center text-red-200">Ticket API request failed.</div>
        ) : backendTickets.length > 0 ? (
          <div className="space-y-4">
            {backendTickets.map((t) => (
              <TicketItem key={t.id} ticket={t} />
            ))}
          </div>
        ) : (
          <div className="card text-center text-slate-400">No backend tickets returned for this phase.</div>
        )}
      </section>

      {/* Frontend tickets */}
      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <span className="badge badge-primary">前端工程</span> Frontend Backlog Tickets
        </h2>
        {isLoading ? (
          <div className="card text-center text-slate-400">Loading frontend tickets from the API...</div>
        ) : isError ? (
          <div className="card text-center text-red-200">Ticket API request failed.</div>
        ) : frontendTickets.length > 0 ? (
          <div className="space-y-4">
            {frontendTickets.map((t) => (
              <TicketItem key={t.id} ticket={t} />
            ))}
          </div>
        ) : (
          <div className="card text-center text-slate-400">No frontend tickets returned for this phase.</div>
        )}
      </section>

      {/* Prev / Next */}
      <nav className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
        {prev ? (
          <Link
            to="/phases/$slug"
            params={{ slug: prev.slug }}
            className="text-slate-300 hover:text-primary"
          >
            ← Phase {prev.phase}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/phases/$slug"
            params={{ slug: next.slug }}
            className="text-right text-slate-300 hover:text-primary"
          >
            Phase {next.phase}: {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
