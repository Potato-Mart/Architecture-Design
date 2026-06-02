import { Link } from '@tanstack/react-router';
import type { Ticket } from '../data/tickets';

export function categoryBadge(category: 'backend' | 'frontend') {
  return category === 'backend'
    ? { label: '後端 Backend', className: 'badge-purple' }
    : { label: '前端 Frontend', className: 'badge-primary' };
}

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const cat = categoryBadge(ticket.category);
  return (
    <Link
      to="/tickets/$id"
      params={{ id: ticket.id }}
      className="card card-hover block"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-primary/10 px-2 py-1 font-mono text-sm text-primary">
          [{ticket.id}]
        </span>
        <span className={`badge ${cat.className}`}>{cat.label}</span>
        <span className="badge badge-success">第 {ticket.phase} 梯次</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{ticket.title}</h3>
      {ticket.tag && <p className="mb-2 text-sm text-slate-400">{ticket.tag}</p>}
      <p className="line-clamp-3 text-sm text-slate-300">{ticket.description}</p>
    </Link>
  );
}
