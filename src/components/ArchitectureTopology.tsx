import { useState } from 'react';
import {
  nodes,
  clientLayer,
  gatewayLayer,
  serviceLayer,
  infraLayer,
  externalLayer,
  type ArchNode,
  type NodeType,
} from '../data/architecture';

const variantClasses: Record<ArchNode['variant'], string> = {
  service:
    'bg-gradient-to-br from-blue-500/20 to-violet-500/20 hover:from-blue-500/40 hover:to-violet-500/40 hover:border-primary',
  db: 'bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 hover:from-emerald-500/40 hover:to-emerald-400/40 hover:border-accent',
  ext: 'bg-gradient-to-br from-amber-500/20 to-amber-400/20 hover:from-amber-500/40 hover:to-amber-400/40 hover:border-amber-400',
  gateway:
    'bg-gradient-to-br from-sky-500/20 to-sky-600/20 hover:from-sky-500/40 hover:to-sky-600/40 hover:border-sky-400 w-full',
};

function badgeForType(type: NodeType): string {
  if (type.includes('Frontend')) return 'badge-primary';
  if (type.includes('Microservice')) return 'badge-purple';
  if (type.includes('Database') || type.includes('Cache') || type.includes('Broker'))
    return 'badge-accent';
  if (type.includes('External')) return 'badge-warning';
  return 'badge-success';
}

function NodeButton({
  id,
  selected,
  onSelect,
}: {
  id: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const node = nodes[id];
  const isSelected = selected === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`min-w-[140px] select-none rounded-lg border border-white/20 px-5 py-4 text-center font-semibold transition-all hover:-translate-y-0.5 ${
        variantClasses[node.variant]
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-ink' : ''}`}
    >
      <span>
        {node.icon} {node.label}
      </span>
      {node.sublabel && (
        <span className="mt-1 block text-xs font-normal text-slate-300">{node.sublabel}</span>
      )}
    </button>
  );
}

function Layer({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-6 ${className}`}
    >
      <span className="absolute -top-3 left-5 bg-ink px-2.5 text-sm font-semibold tracking-wider text-primary">
        {title}
      </span>
      <div className="flex flex-wrap justify-center gap-4">{children}</div>
    </div>
  );
}

const Arrow = () => <div className="text-center text-white/25">▼</div>;

export function ArchitectureTopology() {
  const [selected, setSelected] = useState<string | null>('store');
  const active = selected ? nodes[selected] : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      {/* Topology map */}
      <div className="topology-grid flex flex-col gap-8 overflow-x-auto rounded-2xl border border-white/25 bg-slate-900/50 p-6 sm:p-8">
        <Layer title={clientLayer.title}>
          {clientLayer.nodes.map((id) => (
            <NodeButton key={id} id={id} selected={selected} onSelect={setSelected} />
          ))}
        </Layer>
        <Arrow />
        <Layer title={gatewayLayer.title}>
          {gatewayLayer.nodes.map((id) => (
            <NodeButton key={id} id={id} selected={selected} onSelect={setSelected} />
          ))}
        </Layer>
        <Arrow />
        <Layer title={serviceLayer.title}>
          {serviceLayer.nodes.map((id) => (
            <NodeButton key={id} id={id} selected={selected} onSelect={setSelected} />
          ))}
        </Layer>
        <Arrow />
        <div className="flex flex-col gap-4 md:flex-row">
          <Layer title={infraLayer.title} className="flex-[2]">
            {infraLayer.nodes.map((id) => (
              <NodeButton key={id} id={id} selected={selected} onSelect={setSelected} />
            ))}
          </Layer>
          <Layer title={externalLayer.title} className="flex-1">
            {externalLayer.nodes.map((id) => (
              <NodeButton key={id} id={id} selected={selected} onSelect={setSelected} />
            ))}
          </Layer>
        </div>
      </div>

      {/* Detail panel */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        {active ? (
          <div className="card animate-fadeInRight">
            <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
              <h3 className="text-2xl font-semibold">{active.title}</h3>
              <span className={`badge ${badgeForType(active.type)}`}>{active.type}</span>
            </div>

            <section className="mb-6">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                🛠️ 技術選型 (Tech Stack)
              </h4>
              <p className="text-sm text-slate-300">{active.stack}</p>
            </section>

            <section className="mb-6">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                🎯 核心職責 (Responsibilities)
              </h4>
              <ul className="bullet-list text-sm">
                {active.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                ⚙️ 重點設定與防護 (Settings &amp; Security)
              </h4>
              <ul className="bullet-list text-sm">
                {active.settings.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900/50 p-8 text-center text-slate-400">
            👈 請點擊左側的架構節點以檢視詳細設定
          </div>
        )}
      </div>
    </div>
  );
}
