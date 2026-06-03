import { Link, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { useSyncTicketMutation, useTicketQuery, useTicketsQuery } from '../api/tickets';
import { categoryBadge } from '../components/TicketCard';

export function TicketDetailPage() {
  const { id } = useParams({ from: '/tickets/$id' });
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const { data: ticket, isError, isLoading } = useTicketQuery(id);
  const { data: tickets = [] } = useTicketsQuery();
  const syncTicket = useSyncTicketMutation();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Loading ticket...</h1>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Ticket not found</h1>
        <Link to="/tickets" className="mt-4 inline-block text-primary hover:underline">
          Back to tickets
        </Link>
      </div>
    );
  }

  const cat = categoryBadge(ticket.category);
  const ticketId = ticket.id;
  const idx = tickets.findIndex((item) => item.id === id);
  const prev = idx > 0 ? tickets[idx - 1] : null;
  const next = idx >= 0 && idx < tickets.length - 1 ? tickets[idx + 1] : null;

  function handleSync() {
    setSyncMessage(null);
    syncTicket.mutate(ticketId, {
      onSuccess: () => setSyncMessage('Ticket synced to GitHub.'),
      onError: (error) => {
        setSyncMessage(error instanceof Error ? error.message : 'GitHub sync failed.');
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link to="/tickets" className="mb-8 inline-block text-sm text-slate-400 hover:text-primary">
        Back to tickets
      </Link>

      <article className="card">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-1 font-mono text-sm text-primary">
            [{ticket.id}]
          </span>
          <span className={`badge ${cat.className}`}>{cat.label}</span>
          <Link to="/phases/$slug" params={{ slug: `phase-${ticket.phase}` }}>
            <span className="badge badge-success hover:opacity-80">Phase {ticket.phase}</span>
          </Link>
          <span className={`badge ${ticket.uploadedToGithub ? 'badge-success' : 'badge-warning'}`}>
            {ticket.uploadedToGithub ? 'GitHub synced' : 'Needs GitHub sync'}
          </span>
        </div>

        <h1 className="text-2xl font-bold sm:text-3xl">{ticket.title}</h1>
        {ticket.tag && <p className="mt-3 text-primary">{ticket.tag}</p>}

        <p className="mt-6 text-slate-300">{ticket.description}</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            GitHub issue status
          </div>
          {ticket.uploadedToGithub ? (
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                Synced
                {ticket.githubIssueNumber ? ` as issue #${ticket.githubIssueNumber}` : ''}.
              </p>
              {ticket.githubIssueUrl && (
                <a
                  href={ticket.githubIssueUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-semibold text-primary hover:underline"
                >
                  Open GitHub issue
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                This ticket exists in the backend but has not been uploaded as a GitHub issue yet.
              </p>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncTicket.isPending}
                className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {syncTicket.isPending ? 'Syncing to GitHub...' : 'Sync to GitHub'}
              </button>
            </div>
          )}
          {syncMessage && <p className="mt-3 text-sm text-slate-300">{syncMessage}</p>}
        </div>

        {ticket.acceptance.length > 0 && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Acceptance criteria
            </h2>
            <ul className="bullet-list">
              {ticket.acceptance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-4 text-sm text-slate-400">
          Phase:{' '}
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
            Back [{prev.id}]
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/tickets/$id" params={{ id: next.id }} className="text-slate-300 hover:text-primary">
            [{next.id}] Next
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
