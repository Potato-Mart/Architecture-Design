// Architecture topology + node details, ported from Architecture-Design/docs/architecture.html

export type NodeType =
  | 'Frontend'
  | 'Frontend / POS'
  | 'Gateway / Aggregator'
  | 'Microservice (ACA)'
  | 'Database (NoSQL)'
  | 'In-Memory Cache'
  | 'Message Broker'
  | 'External Service';

export interface ArchNode {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  variant: 'service' | 'db' | 'ext' | 'gateway';
  title: string;
  type: NodeType;
  stack: string;
  responsibilities: string[];
  settings: string[];
}

export interface TopologyLayer {
  title: string;
  nodes: string[]; // node ids
}

export const nodes: Record<string, ArchNode> = {
  store: {
    id: 'store',
    label: 'potato-store',
    sublabel: '(Web/APP)',
    icon: '🛒',
    variant: 'service',
    title: '🛒 potato-store',
    type: 'Frontend',
    stack: 'Web: Vite, React, TS, Tanstack, Tailwind | APP: Kotlin (Android), Swift (iOS)',
    responsibilities: [
      '一般用戶 (B2C) 前台購物體驗',
      '包含網頁版與原生 APP 雙平台',
      '負責購物車、結帳、訂單查詢與直播觀看',
    ],
    settings: [
      '網頁版透過 Azure Static Web Apps (Free 層) 免費部署，享有 SSL 與全域 CDN',
      '實作 React Query / TanStack 進行資料抓取與狀態快取',
      '行動端採用 Fastlane 自動化 CI/CD 部署至雙平台商店',
    ],
  },
  control: {
    id: 'control',
    label: 'potato-control',
    sublabel: '(Admin/POS)',
    icon: '⚙️',
    variant: 'service',
    title: '⚙️ potato-control',
    type: 'Frontend / POS',
    stack: 'Web: Vite, React, TS | APP: Expo, React Native, NativeWind, Zustand',
    responsibilities: [
      '內部員工後台網頁與實體店面 POS 結帳平板',
      '支援庫存盤點、商品上下架、報表檢視與列印自動化揀貨單',
      '支援跨租戶 (Multi-tenant) 上下文切換以切換廠區',
    ],
    settings: [
      'POS 結帳 APP 實作離線優先 (Offline-first) 本機快取',
      '攔截器自動帶入 JWT Bearer Token 並處理 Token 刷新',
      '基於 RBAC 權限動態隱藏導覽列與操作按鈕',
    ],
  },
  partner: {
    id: 'partner',
    label: 'potato-partner',
    sublabel: '(B2B)',
    icon: '🤝',
    variant: 'service',
    title: '🤝 potato-partner',
    type: 'Frontend',
    stack: 'Web: Vite, React, TS, Tanstack, Tailwind | APP: Kotlin, Swift',
    responsibilities: [
      '專供外部盤商 (B2B) 使用的企業採購前台與 APP',
      '顯示階梯式批發價與大宗採購購物車',
      '子帳號管理與採購額度審批 UI',
    ],
    settings: [
      '嚴格的企業帳號 CSRF 與 XSS 防護，驗證 Header 來源',
      '透過 Static Web Apps 設定路由層級的授權控管',
    ],
  },
  gateway: {
    id: 'gateway',
    label: 'Azure Static Web Apps (全球邊緣快取) / ACA 內建 Ingress 路由',
    icon: '☁️',
    variant: 'gateway',
    title: '🛡️ Azure 輕量級閘道 (Ingress)',
    type: 'Gateway / Aggregator',
    stack: 'Azure Container Apps (Envoy Ingress) / Node.js BFF',
    responsibilities: [
      '替換昂貴的 API Management，改用 Container Apps 內建的 HTTP 路由功能節省成本',
      '處理 HTTPS 終止 (TLS Termination) 並將流量分發至後端微服務',
      '第六梯次時才升級導入 APIM 以管理對外金鑰',
    ],
    settings: [
      '利用 Azure Container Apps 環境綁定自訂網域，免除額外伺服器開銷',
      '設定基礎的速率限制 (Rate Limiting) 與 WAF 規則',
      'BFF 層負責併發呼叫多個微服務並聚合成單一 JSON，解決 N+1 延遲問題',
    ],
  },
  'svc-auth': {
    id: 'svc-auth',
    label: '🔐 Auth/Mgmt API',
    icon: '🔐',
    variant: 'service',
    title: '🔐 Mgmt & Auth API',
    type: 'Microservice (ACA)',
    stack: 'Go (Golang), Backend-Shared-Contract, Docker',
    responsibilities: [
      '核發與驗證 JWT Token (對接 Azure Notification Hubs 推播權限)',
      '處理 RBAC 權限與多租戶 (Tenant ID) 驗證邏輯',
      '員工管理與 OAuth2 授權',
    ],
    settings: [
      '部署於 Azure Container Apps (ACA)，享受 200萬次免費請求額度',
      '設定 Scale to Zero (縮容至零)，無流量時自動關閉以省下所有運算費用',
      '密碼採用 bcrypt 雜湊，機密參數存放於 Azure Key Vault',
    ],
  },
  'svc-commerce': {
    id: 'svc-commerce',
    label: '💳 Commerce API',
    icon: '💳',
    variant: 'service',
    title: '💳 Commerce API',
    type: 'Microservice (ACA)',
    stack: 'Go (Golang), Saga Pattern, Docker',
    responsibilities: [
      '處理購物車、結帳邏輯與訂單狀態機 (Order State Machine)',
      '接收 Adyen 金流 Webhook 狀態更新',
      '動態計算 B2B/B2C 差異化定價',
    ],
    settings: [
      '利用 Azure Cache for Redis 實作分散式鎖防護，防止超賣',
      '訂單寫入採分散式事務模式，透過 Event Hubs 達到最終一致性',
      '利用 KEDA 監控佇列深度，當訂單暴增時自動擴展容器數量',
    ],
  },
  'svc-ops': {
    id: 'svc-ops',
    label: '📦 Operations API',
    icon: '📦',
    variant: 'service',
    title: '📦 Operations API',
    type: 'Microservice (ACA)',
    stack: 'Go (Golang), Docker',
    responsibilities: [
      '實體與虛擬庫存數量的盤點與扣除',
      '產品型錄與多媒體資產管理 (上傳至 Azure Blob Storage)',
      '自動產出與列印揀貨單 (PDF/HTML)',
      '產生各門市 (租戶) 的營運報表數據',
    ],
    settings: [
      '強制的 MongoDB 查詢過濾：所有操作皆需注入 Request Context 的 Tenant ID',
      '高頻查詢 (如首頁型錄) 透過 Redis 快取回傳，降低資料庫連線成本',
    ],
  },
  'svc-live': {
    id: 'svc-live',
    label: '🎥 Live Stream API',
    icon: '🎥',
    variant: 'service',
    title: '🎥 Live Stream API',
    type: 'Microservice (ACA)',
    stack: 'Node.js, WebSocket (Socket.io)',
    responsibilities: [
      '建立與管理直播間狀態，呼叫 Mux API 取得直播金鑰',
      '即時聊天室訊息廣播與過濾',
      '「邊看邊買」商品推廣事件 (Event Broadcasting)',
    ],
    settings: [
      'WebSocket 負載平衡在 Container Apps 中需設定 Sticky Sessions',
      '限制單一使用者的發言頻率以防止洗頻',
      '支援連線中斷自動重新連線與歷史訊息追溯',
    ],
  },
  'db-mongo': {
    id: 'db-mongo',
    label: '🍃 MongoDB Atlas',
    icon: '🍃',
    variant: 'db',
    title: '🍃 MongoDB Atlas',
    type: 'Database (NoSQL)',
    stack: 'MongoDB Atlas (Dedicated/Serverless)',
    responsibilities: [
      '全受管的 NoSQL 資料庫，儲存所有永久性業務資料',
      '支援全球分散 (Global Distribution) 與高併發寫入',
      '使用 Collection 儲存具備彈性 Schema 的訂單與多租戶資料',
    ],
    settings: [
      '啟用自動擴展 (Autoscale) 以應對雙 11 突發流量',
      '設定副本集與分片鍵 (Shard Key) 以分散資料',
      '透過 Private Endpoint 或 IP 白名單防範異常連線存取',
    ],
  },
  'db-redis': {
    id: 'db-redis',
    label: '⚡ Azure Cache for Redis',
    icon: '⚡',
    variant: 'db',
    title: '⚡ Azure Cache for Redis',
    type: 'In-Memory Cache',
    stack: 'Azure Cache for Redis (Basic/Standard Tier)',
    responsibilities: [
      '快取高頻讀取的資料 (首頁商品、B2B定價、設定參數)',
      '實作分散式鎖防護以處理高併發結帳',
      '儲存使用者的 Session 與 OTP 狀態',
    ],
    settings: [
      '採用低成本的 Basic 方案作為 MVP 階段配置',
      '設定 TTL 與 volatile-lru 記憶體淘汰策略',
      '啟用資料持久化與異地備援 (未來梯次)',
    ],
  },
  'db-kafka': {
    id: 'db-kafka',
    label: '📨 Azure Event Hubs',
    icon: '📨',
    variant: 'db',
    title: '📨 Azure Event Hubs',
    type: 'Message Broker',
    stack: 'Azure Event Hubs (Kafka Compatible)',
    responsibilities: [
      '扮演事件驅動架構 (Event-Driven) 中的中心匯流排',
      '非同步派發「訂單成立」事件給：扣庫存、發信、推播',
    ],
    settings: [
      '使用 Kafka 相容端點，讓 Go 微服務不需修改程式碼即可接入',
      '配置多個 Consumer Groups 達到平行處理',
      '設定至少一次 (At-Least-Once) 傳遞保證',
    ],
  },
  'ext-adyen': {
    id: 'ext-adyen',
    label: '💳 Adyen POS',
    icon: '💳',
    variant: 'ext',
    title: '💳 Adyen POS / Gateway',
    type: 'External Service',
    stack: 'Adyen Drop-in UI / Terminal API',
    responsibilities: [
      '處理線上信用卡的授權、請款與退款',
      '與實體店面 POS 刷卡機進行網路通訊',
    ],
    settings: [
      '嚴格驗證 Adyen 傳送的 Webhook HMAC 簽章',
      '實作 Idempotency Key 避免網路斷線導致的重複扣款',
    ],
  },
  'ext-stream': {
    id: 'ext-stream',
    label: '☁️ Mux API / AWS IVS',
    icon: '☁️',
    variant: 'ext',
    title: '☁️ 專業直播 SaaS API',
    type: 'External Service',
    stack: 'Mux API / AWS IVS',
    responsibilities: [
      '提供超低延遲的直播影音串流轉碼與全域發佈',
      '自動將 RTMP 推流轉換為多畫質的 HLS 格式',
    ],
    settings: [
      '考量自行轉檔極度消耗伺服器資源，外包串流引擎以降低維護成本',
      '配置直播後自動轉錄為隨選影音 (VOD) 並存回 Azure Blob Storage',
      '透過 API 動態生成一次性推流金鑰確保安全性',
    ],
  },
};

export const clientLayer: TopologyLayer = {
  title: '使用者端層 (CLIENT)',
  nodes: ['store', 'control', 'partner'],
};

export const gatewayLayer: TopologyLayer = {
  title: '邊緣與閘道層 (EDGE & GATEWAY)',
  nodes: ['gateway'],
};

export const serviceLayer: TopologyLayer = {
  title: '微服務層 (SERVERLESS MICROSERVICES - ACA)',
  nodes: ['svc-auth', 'svc-commerce', 'svc-ops', 'svc-live'],
};

export const infraLayer: TopologyLayer = {
  title: '基礎設施層 (INFRASTRUCTURE)',
  nodes: ['db-mongo', 'db-redis', 'db-kafka'],
};

export const externalLayer: TopologyLayer = {
  title: '外部服務層 (EXTERNAL)',
  nodes: ['ext-adyen', 'ext-stream'],
};
