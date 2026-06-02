# 🥔 Potato Mart (土豆商城) 系統架構與設計文件

這是一份涵蓋「土豆商城 (Potato Mart)」從初期 MVP 到未來可規模化、支援 VR 購物體驗的**完整系統架構與發展梯次規劃文件**。

本專案採用**極致降本**的微軟 Azure Serverless 微服務架構，搭配 MongoDB Atlas，確保在享有強大擴充彈性的同時，將初期的營運成本降至最低。

## 🌐 線上預覽 (Live Preview)

您可以直接點擊下方連結，檢視完整的互動式架構圖與各梯次的詳細開發任務 (Backlog Tickets)：

👉 **[Potato Mart 系統架構預覽 (Netlify)](https://architecture-design-preview.netlify.app/)**

---

## 🏗️ 系統架構亮點 (Architecture Highlights)

本系統採微服務架構 (Microservices Architecture)，並根據領域驅動設計 (DDD) 拆分核心業務：

*   **前端網頁 (Web)**：全面採用 **Vite + React + TypeScript + Tailwind CSS**，並部署於 **Azure Static Web Apps** (享有免費層與全域 CDN 快取)。
*   **行動端 (APP)**：
    *   消費者與 B2B 客戶端採用原生開發：**Kotlin (Android)** 與 **Swift (iOS)**，追求極致流暢的購物與直播觀看體驗。
    *   內部營運 POS 機採用 **Expo + React Native + NativeWind**，具備 Offline-first (離線優先) 設計。
*   **後端微服務 (Microservices)**：採用 **Go (Golang)** 開發高效能 API (包含 Auth, Commerce, Operations 等)。直播服務則採用 **Node.js** 處理 WebSocket 併發。
*   **基礎設施 (Infrastructure)**：
    *   **運算層**：採用 **Azure Container Apps (ACA)**，具備 Scale to Zero 特性，免除 Kubernetes (AKS) 的高昂月費與維護成本。
    *   **資料庫**：採用 **MongoDB Atlas**，支援靈活的 Schema 與多租戶 (Multi-tenant) 資料庫隔離。
    *   **快取與訊息佇列**：利用 **Azure Cache for Redis** 防止超賣，並透過 **Azure Event Hubs** 進行非同步事件解耦。

---

## 📅 發展梯次與里程碑 (Phases & Milestones)

整個專案的實作劃分為 8 個主要梯次 (Phases)，每個梯次皆有明確的 GitHub Backlog Tickets 與驗收標準 (AC)：

1.  **第一梯次 (6月底前) - 內部 MVP**：建置 Azure ACA 與 MongoDB 基礎，實作內部員工登入、庫存盤點、揀貨單自動化與 POS 基礎綁定。
2.  **第二梯次 (7月底前) - 替換現有系統**：淘汰舊有 Pisell 系統，完成購物車結帳、Adyen POS 金流串接，並將舊資料透過 ETL 轉移。
3.  **第三梯次 (9月底前) - 雙平台網頁與手機版上線**：正式發布 B2C 與 B2B 專屬平台，行動端提交 App Store 與 Google Play 審查，並整合推播功能。
4.  **第四梯次 (11月底前) - 效能強化與直播導入**：壓測系統以應對年底旺季，導入 Redis 分散式鎖，並串接專業直播 SaaS (Mux API / AWS IVS) 實作「邊看邊買」。
5.  **第五梯次 (2027年2月底) - 可規模化複製系統 (SaaS 化)**：重構資料庫以支援多租戶 (Multi-tenancy)，支援快速展店與廠區獨立管理。
6.  **第六梯次 (2027年5月底) - 對外開放系統 (Open API)**：導入企業級 Azure API Management (APIM)，建立 Developer Portal 與 Webhook 機制供外部廠商對接。
7.  **第七梯次 (2027年7月底) - 高併發可擴展系統**：實作 MongoDB Sharding，導入 BFF (Backend-For-Frontend) 架構與背景 Worker 處理耗時任務。
8.  **第八梯次 (2027年下半) - VR 版商場體驗**：採用 WebXR 與 Three.js 打造虛擬展間，結合 3D 模型與 AR 技術，提供元宇宙沉浸式購物體驗。

---

## 📂 資料夾結構 (Repository Structure)

```text
Architecture-Design/
├── README.md               # 本文件
└── docs/                   # 生成的 HTML 文件目錄 (部署至 Netlify)
    ├── css/
    │   └── style.css       # 全域共用樣式表
    ├── index.html          # 總覽儀表板 (Dashboard)
    ├── architecture.html   # 互動式全景架構圖 (系統拓樸)
    ├── phase1.html         # 第一梯次任務清單
    ├── phase2.html         # 第二梯次任務清單
    ├── phase3.html         # 第三梯次任務清單
    ├── phase4.html         # 第四梯次任務清單
    ├── phase5.html         # 第五梯次任務清單
    ├── phase6.html         # 第六梯次任務清單
    ├── phase7.html         # 第七梯次任務清單
    └── phase8.html         # 第八梯次任務清單
```
