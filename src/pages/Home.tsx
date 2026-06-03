import { Link } from '@tanstack/react-router';
import { ArchitectureTopology } from '../components/ArchitectureTopology';
import { phases } from '../data/phases';
import { useTicketsQuery } from '../api/tickets';

const milestones = [
  {
    range: '6月~7月',
    text: '淘汰舊系統 (Pisell)，實作核心商業與營運。',
  },
  {
    range: '9月~11月',
    text: '全通路覆蓋 (APP、網頁、直播)。',
  },
  {
    range: '2027年',
    text: '規模化複製、Open API、海量擴展與 VR。',
  },
];

export function HomePage() {
  const { data: tickets = [], isError, isLoading } = useTicketsQuery();
  const backendCount = tickets.filter((t) => t.category === 'backend').length;
  const frontendCount = tickets.filter((t) => t.category === 'frontend').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="animate-fadeInUp text-center">
        <img
          src="/logo.png"
          alt="土豆商城"
          className="mx-auto mb-8 h-24 w-24 rounded-2xl object-contain shadow-lg"
        />
        <span className="badge badge-primary mb-4">Cost-Optimized · Azure Serverless</span>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="brand-text">土豆商城</span> 架構與開發藍圖
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          將土豆商城系統從最初的內部 MVP，一路擴展至能承載海量流量與支援多租戶架構的大型平台，最終跨足 WebXR 虛擬商場體驗。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/architecture"
            className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-ink transition hover:opacity-90"
          >
            檢視全景架構圖
          </Link>
          <Link
            to="/phases"
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/5"
          >
            瀏覽開發梯次
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: '開發梯次', value: phases.length },
          { label: '總任務數', value: isLoading ? '...' : tickets.length },
          { label: '後端 Tickets', value: isLoading ? '...' : backendCount },
          { label: '前端 Tickets', value: isLoading ? '...' : frontendCount },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-3xl font-bold brand-text">{s.value}</div>
            <div className="mt-1 text-sm text-slate-400">{s.label}</div>
          </div>
        ))}
      </section>
      {isError && (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Ticket API is unavailable, so live ticket counts cannot be shown right now.
        </div>
      )}

      {/* Whole architecture display */}
      <section className="mt-20">
        <div className="mb-8 text-center">
          <span className="badge badge-accent mb-3">System Topology</span>
          <h2 className="text-3xl font-bold">互動式全景系統架構</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            以高性價比、無伺服器 (Serverless) 為核心基礎設施。點擊方塊檢視各模組的技術選型與設定。
          </p>
        </div>
        <ArchitectureTopology />
      </section>

      {/* Milestones */}
      <section className="mt-20 grid gap-8 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <span className="badge badge-primary">里程碑</span> 階段任務
          </h2>
          <ul className="bullet-list">
            {milestones.map((m) => (
              <li key={m.range}>
                <strong className="text-white">{m.range}：</strong>
                {m.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <span className="badge badge-success">任務管理</span> 可執行的 Backlog Tickets
          </h2>
          <p className="mb-3 text-slate-300">
            每個梯次皆包含極度詳細的「後端」與「前端」任務，每個任務皆附有具體的驗收標準 (Acceptance Criteria)。
          </p>
          <ul className="bullet-list">
            <li>標籤 <strong className="text-white">[BE-XXX]</strong> 代表 Backend (後端)。</li>
            <li>標籤 <strong className="text-white">[FE-XXX]</strong> 代表 Frontend (前端)。</li>
            <li>設計為可直接複製到 GitHub Projects 的 Ticket 格式。</li>
          </ul>
          <Link to="/tickets" className="mt-4 inline-block font-semibold text-primary hover:underline">
            檢視全部任務 →
          </Link>
        </div>
      </section>

      {/* Phase quick links */}
      <section className="mt-20">
        <h2 className="mb-8 text-center text-3xl font-bold">開發梯次總覽</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((p) => (
            <Link
              key={p.slug}
              to="/phases/$slug"
              params={{ slug: p.slug }}
              className="card card-hover block"
            >
              <div className="mb-2 text-sm font-mono text-primary">Phase {p.phase}</div>
              <h3 className="mb-2 font-semibold">{p.title}</h3>
              <p className="text-xs text-slate-400">{p.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
