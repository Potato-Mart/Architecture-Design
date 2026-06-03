// AUTO-GENERATED from Architecture-Design/docs/phase*.html. Ticket data is loaded from the API. Do not edit by hand.
export interface Phase {
  phase: number;
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  goals: string[];
  risks: string[];
  improvements: string[];
}

export const phases: Phase[] = [
  {
    "phase": 1,
    "slug": "phase-1",
    "title": "第一梯次：內部 MVP",
    "subtitle": "目標期限：6月底前 | 重點：高 CP 值 Azure 基礎設施與內部營運",
    "intro": "專注於內部核心功能，讓團隊能提早熟悉新系統，並確立最低成本的 Azure 雲端環境標準。",
    "goals": [
      "基礎建設：配置 MongoDB Atlas 與 Azure Container Apps (ACA)，捨棄昂貴的 K8s 叢集。",
      "前端部署：全面採用 Azure Static Web Apps 免費層級。",
      "身分驗證 (Auth)：實作內部員工 JWT 登入模組。",
      "基礎營運：產品型錄、庫存盤點管理、揀貨單自動化與 POS 基礎設定。"
    ],
    "risks": [
      "系統初期可能不穩定，導致內部測試受阻。",
      "MongoDB Atlas 設定錯誤可能導致效能瓶頸或費用暴增。",
      "缺乏龐大的 API Gateway，初期需倚賴 ACA 內建 Ingress，管理較為陽春。"
    ],
    "improvements": [
      "第一版先開通 MongoDB Atlas 無伺服器模式 (Serverless) 或共享叢集以控制成本。",
      "利用 Azure Container Apps 的 Scale to Zero 特性，降低非營業時間的運算費用。",
      "嚴格落實 Azure DevOps CI/CD 自動化發布流水線，減少人工作業。"
    ]
  },
  {
    "phase": 2,
    "slug": "phase-2",
    "title": "第二梯次：替換現有系統與 POS 串接",
    "subtitle": "目標期限：7月底前 | 重點：商業結帳、Adyen 金流與舊系統退役",
    "intro": "完全淘汰現有的 Pisell 系統，並整合全新的線下實體店面結帳體驗與 Azure 佇列。",
    "goals": [
      "完整商業模組：購物車、結帳流程、訂單狀態機。",
      "實體門市整合：開發原生平板 APP (Potato-Control) 導入新 POS 機。",
      "金流處理：完成 Adyen POS 支付金流串接。",
      "異步處理：引入 Azure Event Hubs 作為 Webhook 與結帳重試佇列。"
    ],
    "risks": [
      "實體門市網路不穩導致 POS 機與 Adyen 刷卡機斷線。",
      "Adyen API 回應延遲、Webhook 漏發，導致訂單狀態卡在「付款中」。",
      "Pisell 舊有資料格式不相容導致寫入 MongoDB Atlas 失敗。"
    ],
    "improvements": [
      "在 Potato-Control APP 中實作離線模式 (Offline-first)，網路恢復後自動同步。",
      "後端導入 Azure Service Bus 或 Event Hubs 佇列，確保交易事件百分百送達。",
      "撰寫專門的 ETL (Extract, Transform, Load) 腳本處理 Pisell 資料清理。"
    ]
  },
  {
    "phase": 3,
    "slug": "phase-3",
    "title": "第三梯次：雙平台網頁與手機版上線",
    "subtitle": "目標期限：9月底前 | 重點：B2C 與 B2B 客戶端、原生行動 APP 雙平台上架",
    "intro": "正式對一般消費者 (B2C) 與企業客戶 (B2B) 發布產品，涵蓋網頁版與原生行動應用程式 (iOS/Android)。",
    "goals": [
      "B2B 專屬平台：發布 Potato-Partner (Web & APP)，提供企業批量採購與階梯式定價。",
      "行動端發布：利用 Kotlin (Android) 與 Swift (iOS) 將 Potato-Store APP 提交至 App Store / Google Play 雙平台商店。",
      "推播系統：實作 Azure Notification Hubs 推送促銷通知與訂單狀態至用戶手機。"
    ],
    "risks": [
      "Apple App Store 審查可能因為隱私權或金流合規問題而遭退件，導致延遲上線。",
      "Azure 輕量級 Ingress 面對大量 B2C 惡意請求或爬蟲時，缺乏進階 WAF 的保護。",
      "雙平台 (B2C 與 B2B) 會員資料打架或越權存取。"
    ],
    "improvements": [
      "提早至少兩週將 iOS 版本送審 TestFlight 進行合規測試。",
      "在此階段可考慮導入平價版的 Azure Front Door (Standard) 作為邊緣防護與 WAF，擋掉惡意流量。",
      "在 Auth API 嚴格區分 `Role` (消費者 vs 企業)，並在 ACA 的 API 路由層嚴格校驗 JWT。"
    ]
  },
  {
    "phase": 4,
    "slug": "phase-4",
    "title": "第四梯次：效能強化與直播導入",
    "subtitle": "目標期限：11月底前 | 重點：迎接年底旺季、直播帶貨 (方案A)、效能除錯",
    "intro": "在年底的電商購物旺季 (如雙11、黑五) 前完成系統壓測，並上線「電商直播」功能以刺激銷量。",
    "goals": [
      "全面檢視 Phase 1~3 的所有功能，進行深度除錯 (Bug fixing) 與效能優化。",
      "在網頁與 APP 中整合「電商直播 (Live Streaming)」功能，實現邊看邊買。",
      "利用 Azure Cache for Redis 快取與 MongoDB Atlas 索引優化，提升回應速度。"
    ],
    "risks": [
      "高併發下單 (搶購) 可能導致超賣問題 (Overselling)。",
      "影片直播串流極耗流量，若自己架設流媒體伺服器，可能導致頻寬塞爆且成本難以控制。",
      "直播期間的大量即時聊天訊息，可能拖垮後端微服務。"
    ],
    "improvements": [
      "透過 Redis 分散式鎖 (Distributed Lock) 防止庫存超賣。",
      "**採用「方案 A」**：直播串流與轉碼交由專業的外部 SaaS (如 Mux API 或是 AWS IVS) 處理，減輕主伺服器負擔。",
      "將聊天室微服務抽離成獨立的 Socket.io/Websocket Container App 叢集。"
    ]
  },
  {
    "phase": 5,
    "slug": "phase-5",
    "title": "第五梯次：可規模化複製系統 (SaaS 化)",
    "subtitle": "目標期限：2027年2月底前 | 重點：多租戶架構 (Multi-tenancy)、新廠區與門市快速展店",
    "intro": "重構現有資料庫與應用層邏輯，將平台轉型為類 SaaS 模式，以支援未來業務的快速擴張與展店需求。",
    "goals": [
      "系統升級為「可規模化複製 (Scalable & Replicable)」，能快速部署給新的廠區與實體門市使用。",
      "提供多租戶 (Multi-tenant) 管理，支援獨立的庫存、員工與帳務結算。",
      "利用 MongoDB Atlas 分區能力，建立「總部 (Global) 與 門市 (Local)」的分級設定中心。"
    ],
    "risks": [
      "租戶資料隔離不夠嚴謹，可能導致 A 門市看到 B 門市的訂單或營收 (Cross-tenant Data Leak)。",
      "全域庫存 (總倉) 與區域庫存 (門市) 的調撥邏輯複雜，容易出現庫存對不齊的 Bug。"
    ],
    "improvements": [
      "在業務邏輯層強制注入 `tenant_id` 的嚴格過濾，確保 MongoDB Atlas 租戶資料絕對隔離。",
      "建立階層式權限架構與全域/區域參數的覆寫 (Override) 機制。",
      "所有內部 API 路由加入 `/{tenant_id}/` 作為基礎前綴，並由 Gateway/Ingress 阻擋非法越權。"
    ]
  },
  {
    "phase": 6,
    "slug": "phase-6",
    "title": "第六梯次：對外開放系統 (Open API)",
    "subtitle": "目標期限：2027年5月底前 | 重點：升級 Azure API Management、外部開發者入口",
    "intro": "開放系統核心能力，讓外部夥伴、物流供應商或其他企業能以程式化方式對接我們的電商與庫存資料。",
    "goals": [
      "升級基礎設施：正式導入企業級的 Azure API Management (APIM) 作為對外防護閘道。",
      "實作 OAuth 2.0 (Client Credentials) 以核發存取金鑰 (API Key)。",
      "建立 Developer Portal (開發者入口網站)，提供詳細的 API 文件 (Swagger/OpenAPI)。"
    ],
    "risks": [
      "開放對外 API 若缺乏完善的限流與配額管理，可能遭受 DDoS 攻擊。",
      "外部開發者呼叫 API 造成資料毀損或越權存取他人資料。",
      "APIM 服務訂閱與計費模型若設計不當，可能導致營收損失。"
    ],
    "improvements": [
      "透過 Azure API Management 實施嚴格的 Subscription Key 與速率限制 (Rate Limiting)。",
      "提供隔離的 Sandbox (測試環境) 供合作夥伴開發測試。",
      "在 APIM 層實作 Request/Response 驗證，阻擋不符合 OpenAPI 規範的 payload。"
    ]
  },
  {
    "phase": 7,
    "slug": "phase-7",
    "title": "第七梯次：高併發可擴展系統",
    "subtitle": "目標期限：2027年7月底前 | 重點：MongoDB Sharding、背景非同步處理、BFF 架構",
    "intro": "重構基礎設施與資料庫架構，確保系統能乘載指數型成長的海量資料與流量。",
    "goals": [
      "資料層擴展：針對 MongoDB Atlas 實作全球分散式 (Global Distribution) 與分片 (Sharding)。",
      "運算層解耦：導入後台背景工作者 (Background Workers)，減輕 API 伺服器負擔。",
      "網路層優化：前端導入 Backend-For-Frontend (BFF) 架構，解決 Client 端發送過多 API 請求造成的延遲。"
    ],
    "risks": [
      "MongoDB Shard Key 若設計不良 (例如熱點集中)，可能導致特定資料節點效能崩潰。",
      "前端過度依賴單一 BFF 節點，BFF 故障將導致整個網站癱瘓。"
    ],
    "improvements": [
      "慎選 Shard Key (如使用 `tenant_id` 與 Hashed ObjectID 組合) 確保資料均勻分佈。",
      "BFF 層採用 Node.js 輕量化實作，並且在 Azure Container Apps 部署多個 Replica 進行負載平衡。"
    ]
  },
  {
    "phase": 8,
    "slug": "phase-8",
    "title": "第八梯次：VR 版商場體驗",
    "subtitle": "目標期限：2027年下半年 | 重點：WebXR 網頁先鋒版、3D 建模與互動體驗",
    "intro": "導入全新的元宇宙/虛擬實境概念，提升消費者互動體驗與品牌科技感。",
    "goals": [
      "基於瀏覽器的 VR：採用 WebXR 與 Three.js 實作網頁版虛擬展間。",
      "行動端擴增：視網頁版進度，逐步將 3D 模型檢視能力 (AR/VR) 整合入原生 APP。",
      "沈浸式購物：將原有的 Commerce API 橋接至 3D 介面中，實現點擊虛擬商品直接加入購物車。"
    ],
    "risks": [
      "3D 模型 (GLTF/OBJ) 檔案過大，導致網頁載入時間過長，流失使用者。",
      "手機端 WebGL 效能不足導致嚴重的卡頓或設備發燙。",
      "VR 購物動線設計不良，反而降低結帳轉換率。"
    ],
    "improvements": [
      "模型資產進行抽殼與多邊形減面 (Decimation) 處理，並嚴格利用 Azure Blob Storage 的 CDN 邊緣節點進行快取。",
      "設計 2D/3D 切換按鈕，若偵測到設備效能不足，自動降級 (Graceful Degradation) 回 2D 介面。"
    ]
  }
];
