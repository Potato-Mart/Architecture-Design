import { Link } from '@tanstack/react-router';
import { PageHeader } from '../components/PageHeader';

const stack = [
  { name: 'Vite + React + TypeScript', desc: '前端核心框架，快速開發與型別安全。' },
  { name: 'Tailwind CSS', desc: '原子化 CSS，打造一致的玻璃擬態設計語言。' },
  { name: 'TanStack Router + Query', desc: '型別安全路由與資料抓取/快取狀態管理。' },
  { name: 'Go (Golang) 微服務', desc: '部署於 Azure Container Apps，Scale to Zero 極致降本。' },
  { name: 'MongoDB Atlas', desc: '全受管 NoSQL 資料庫，彈性 Schema 與多租戶。' },
  { name: 'Azure Serverless', desc: 'Static Web Apps、Event Hubs、Cache for Redis 等雲端服務。' },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="關於本藍圖 (About)"
        subtitle="土豆商城架構與開發藍圖 — 一份以極致降本與無伺服器架構為核心的工程規劃。"
        badge={{ label: '關於 About', className: 'badge-accent' }}
      />

      <div className="card">
        <h2 className="mb-3 text-xl font-semibold">願景</h2>
        <p className="text-slate-300">
          將土豆商城系統從最初的內部 MVP，一路擴展至能承載海量流量與支援多租戶架構的大型平台，最終跨足 WebXR 虛擬商場體驗。
          整體架構以高性價比、無伺服器 (Serverless) 為核心，善用 Azure Container Apps 的 Scale to Zero
          特性與免費層級服務，在非營業時間自動縮容以最小化雲端開銷。
        </p>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">技術選型 (Tech Stack)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {stack.map((s) => (
            <div key={s.name} className="card">
              <h3 className="mb-1 font-semibold text-primary">{s.name}</h3>
              <p className="text-sm text-slate-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 card">
        <h2 className="mb-3 text-xl font-semibold">如何使用本站</h2>
        <ul className="bullet-list">
          <li>
            <Link to="/architecture" className="text-primary hover:underline">全景架構</Link>
            ：互動式系統拓樸圖，點擊節點檢視技術選型與防護設定。
          </li>
          <li>
            <Link to="/phases" className="text-primary hover:underline">開發梯次</Link>
            ：八個梯次的目標、風險、改進與完整任務清單。
          </li>
          <li>
            <Link to="/tickets" className="text-primary hover:underline">任務 Tickets</Link>
            ：可搜尋與篩選的全部 Backlog Tickets，附驗收標準。
          </li>
        </ul>
      </div>
    </div>
  );
}
