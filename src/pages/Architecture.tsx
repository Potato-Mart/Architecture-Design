import { PageHeader } from '../components/PageHeader';
import { ArchitectureTopology } from '../components/ArchitectureTopology';

export function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="互動式全景系統架構 (System Topology)"
        subtitle="以高性價比、無伺服器 (Serverless) 為核心基礎設施。請點擊方塊檢視各模組的技術選型與設定。"
        badge={{ label: '全景架構 Architecture', className: 'badge-accent' }}
      />
      <ArchitectureTopology />
    </div>
  );
}
