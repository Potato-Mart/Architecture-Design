export function PageHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: { label: string; className?: string };
}) {
  return (
    <header className="mb-12 animate-fadeInDown">
      {badge && (
        <span className={`badge mb-4 ${badge.className ?? 'badge-primary'}`}>{badge.label}</span>
      )}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-3xl text-lg text-slate-400">{subtitle}</p>}
    </header>
  );
}
