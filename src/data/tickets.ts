// AUTO-GENERATED from Architecture-Design/docs/phase*.html. Do not edit by hand.
export interface Ticket {
  id: string;
  title: string;
  tag: string;
  description: string;
  acceptance: string[];
  category: 'backend' | 'frontend';
  phase: number;
  phaseTitle: string;
}

export const tickets: Ticket[] = [
  {
    "id": "BE-101",
    "title": "配置 MongoDB Atlas 與基礎 Collections",
    "tag": "[基礎設施: MongoDB / Go]",
    "description": "設計並建置 MongoDB Atlas 的 Management 與 Operations 集合，包含員工 (Users, Roles) 與庫存 (SKUs, Inventories)。",
    "acceptance": [
      "完成 MongoDB Migration 腳本或建立必要的 Index (如 Unique Index)，無報錯執行。",
      "完成關聯設計 (利用 ObjectId 參照如 `inventory_id` 對應 `sku_id`)。"
    ],
    "category": "backend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "BE-102",
    "title": "實作 Backend-Shared-Contract",
    "tag": "[程式庫: Backend-Shared-Contract (Go)]",
    "description": "在獨立 Repository 定義全域使用的 Enums (如訂單狀態碼、角色列舉)、DTOs (Data Transfer Objects)。",
    "acceptance": [
      "完成 Go 語言的 Struct 宣告，並加上適當的 JSON/BSON Tag。",
      "發布至私有 Git 庫或 Azure Artifacts 供其他微服務 Import。"
    ],
    "category": "backend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "BE-103",
    "title": "開發 JWT 身分驗證模組與 RBAC API",
    "tag": "[微服務: Mgmt & Auth API (Go)]",
    "description": "實作員工登入端點 (`/api/v1/auth/login`)，發放 JWT Access Token。實作 RBAC 權限檢查 Middleware。",
    "acceptance": [
      "密碼必須使用 bcrypt 進行雜湊加密儲存。",
      "Middleware 能夠正確解析 Token 並拒絕無權限的存取 (回傳 401/403)。"
    ],
    "category": "backend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "BE-104",
    "title": "部署服務至 Azure Container Apps (ACA)",
    "tag": "[基礎設施: ACA / DevOps]",
    "description": "捨棄昂貴的 AKS，改為撰寫 ACA Bicep 腳本或透過 Azure CLI，並在 Azure DevOps 建立 CI/CD 流水線。設定 Scale to Zero 以極小化成本。",
    "acceptance": [
      "Git Commit 推送至 main 分支後，能自動編譯 Docker Image 推送至 ACR，並成功更新 ACA 容器。"
    ],
    "category": "backend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "BE-105",
    "title": "開發揀貨單自動化產出與列印 API",
    "tag": "[微服務: Operations API (Go)]",
    "description": "針對成立的訂單自動生成 PDF 或 HTML 格式的揀貨單 (Picking List)，支援批次匯出功能。",
    "acceptance": [
      "能根據倉庫儲位排序揀貨清單，提升店員揀貨效率。",
      "API 回應時間小於 500ms，產生的 PDF 需支援條碼/QR Code 掃描。"
    ],
    "category": "backend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "FE-101",
    "title": "搭建 potato-control 網頁後台框架",
    "tag": "[前端專案: Potato-Control (Web)]",
    "description": "使用 Vite + React + TypeScript 初始化專案。配置 Tailwind CSS，設定 React Router 與全域狀態 (Tanstack Query)。",
    "acceptance": [
      "成功執行 `npm run dev` 且無 TypeScript 錯誤。",
      "完成基礎的左側導覽列 (Sidebar) 與頂部列 (Header) Layout 元件。"
    ],
    "category": "frontend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "FE-102",
    "title": "實作登入頁面與 Token 攔截器 (Interceptor)",
    "tag": "[前端專案: Potato-Control (Web)]",
    "description": "實作登入表單 UI。設定 Axios/Fetch Interceptor，自動在後續 API Request 的 Header 加上 `Authorization: Bearer `。",
    "acceptance": [
      "輸入錯誤帳密能正確顯示來自 API 的錯誤訊息。",
      "登入成功後能正確將 Token 存入 localStorage / Cookie，並跳轉至首頁。"
    ],
    "category": "frontend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "FE-103",
    "title": "開發「庫存盤點」React 元件與表單",
    "tag": "[前端專案: Potato-Control (Web)]",
    "description": "提供快速檢索 SKU 的 DataGrid (可搭配 Tanstack Table)，並實作單筆或批次修改庫存數量的對話框 (Dialog)。",
    "acceptance": [
      "能夠透過名稱或 SKU 條碼即時搜尋商品。",
      "修改數量送出後，需有防呆確認視窗，並能顯示 API 成功或失敗的 Toast 提示。"
    ],
    "category": "frontend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "FE-104",
    "title": "前端資源免費部署至 Azure Static Web Apps",
    "tag": "[基礎設施: DevOps / Frontend]",
    "description": "設定 Azure Pipelines 將編譯後的 Vite 打包產物部署至 Azure Static Web Apps 的 Free 層級，享有零成本託管與全域快取。",
    "acceptance": [
      "開發團隊 Push 至 Git 後能自動發布到 dev 環境網址，且具備 SSL 憑證。"
    ],
    "category": "frontend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "FE-105",
    "title": "實作 POS 機基本設定與收銀綁定 UI",
    "tag": "[前端專案: Potato-Control (Web & APP)]",
    "description": "在後台與 POS APP 實作收銀機綁定設定，包含硬體周邊 (掃碼槍、出單機) 的連線設定與基礎 UI。",
    "acceptance": [
      "可透過藍牙或網域 IP 成功綁定熱感應印表機。",
      "具備「測試列印」功能按鈕。"
    ],
    "category": "frontend",
    "phase": 1,
    "phaseTitle": "第一梯次：內部 MVP"
  },
  {
    "id": "BE-201",
    "title": "開發 Commerce 領域 API (購物車與結帳)",
    "tag": "[微服務: Commerce API (Go)]",
    "description": "實作建立訂單、更新購物車、計算運費與稅金之 API，並處理併發下單的問題。",
    "acceptance": [
      "API 能正確計算商品小計、稅金與折扣。",
      "使用 MongoDB 的分散式 Transaction，確保扣庫存與建立訂單必須同時成功或失敗。"
    ],
    "category": "backend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "BE-202",
    "title": "整合 Adyen POS 金流與 Webhook 佇列",
    "tag": "[微服務: Commerce API (Go) / Azure Service Bus]",
    "description": "實作安全的 Webhook 端點以接收 Adyen 非同步付款結果，並將 Payload 直接放入 Azure Service Bus Queue。",
    "acceptance": [
      "能成功驗證來自 Adyen 的 HMAC 簽章，防止偽造請求。",
      "Webhook 請求需在 2 秒內回覆 200 OK，後續交由 Worker 從 Service Bus 取出慢慢處理，處理失敗需轉移至 Dead-Letter Queue。"
    ],
    "category": "backend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "BE-203",
    "title": "實作 POS 機離線資料同步端點 (Bulk Sync API)",
    "tag": "[微服務: Commerce API (Go)]",
    "description": "提供批次上傳 (Bulk upload) API，讓實體店 POS 機重新連網時能一次性上傳所有未結訂單。",
    "acceptance": [
      "API 必須支援接收 JSON Array，並以 MongoDB `insertMany` 或 `bulkWrite` 的方式寫入，避免佔用連線池。"
    ],
    "category": "backend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "BE-204",
    "title": "Pisell 資料轉移 ETL 腳本開發",
    "tag": "[工具程式: Data-Migrator (Python / Go)]",
    "description": "撰寫腳本將舊系統的 SQL/CSV 資料匯出，清理並轉換成符合新 MongoDB Atlas 綱要的格式後寫入。",
    "acceptance": [
      "會員的密碼雜湊能夠無縫轉移，確保舊會員不需強制重設密碼。",
      "歷史訂單資料成功匯入，並且在前後端系統均可正確渲染。"
    ],
    "category": "backend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "FE-201",
    "title": "搭建 potato-store 顧客前台網站",
    "tag": "[前端專案: Potato-Store (Web)]",
    "description": "使用 Vite + React + TypeScript 框架，實作首頁、商品列表與購物車的 State Management (Zustand)。",
    "acceptance": [
      "購物車資料需同步儲存於 localStorage，重新整理頁面後不流失。"
    ],
    "category": "frontend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "FE-202",
    "title": "實作結帳表單與 Adyen Drop-in UI",
    "tag": "[前端專案: Potato-Store (Web)]",
    "description": "開發包含填寫收件地址、選擇運送方式的結帳流程，並嵌入 Adyen Web Drop-in 元件供線上刷卡。",
    "acceptance": [
      "使用者成功刷卡後，需正確跳轉至「付款成功」頁面並清除購物車。",
      "若信用卡被拒絕，需顯示對應的友善錯誤提示。"
    ],
    "category": "frontend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "FE-203",
    "title": "搭建 potato-control POS 機 APP (Expo/React Native)",
    "tag": "[行動端: Potato-Control (APP)]",
    "description": "使用 Expo + React Native + NativeWind 建立平板專用 POS 介面。配置 Expo Router 管理路由。",
    "acceptance": [
      "APP 需針對 iPad/Android 平板等大螢幕設備進行橫向 (Landscape) UI 最佳化。"
    ],
    "category": "frontend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "FE-204",
    "title": "實作 POS 機 Offline-first 結帳邏輯",
    "tag": "[行動端: Potato-Control (APP)]",
    "description": "在 POS APP 中，使用 AsyncStorage 暫存斷線時的訂單，並實作背景同步 (Background Sync)。",
    "acceptance": [
      "拔除平板網路後，店員仍能點選商品並建立本機訂單。",
      "網路恢復後，系統會自動在背景呼叫 [BE-203] 進行批次同步，並提供成功 Toast 提示。"
    ],
    "category": "frontend",
    "phase": 2,
    "phaseTitle": "第二梯次：替換現有系統與 POS 串接"
  },
  {
    "id": "BE-301",
    "title": "開發 B2B 階梯式定價與審批 API",
    "tag": "[微服務: Commerce API (Go)]",
    "description": "實作企業帳號專屬的定價邏輯，支援依採購數量動態計算折扣 (Tiered Pricing)，並實作企業內部子帳號的採購額度審批 (Approval Workflow)。",
    "acceptance": [
      "企業購物車計算出的單價必須正確反映折扣階層。",
      "超過採購額度的訂單狀態必須進入 `PENDING_APPROVAL`。"
    ],
    "category": "backend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "BE-302",
    "title": "串接 Azure Notification Hubs 實作推播系統",
    "tag": "[微服務: Ops / Auth API (Go)]",
    "description": "註冊行動端設備的 FCM (Android) 與 APNs (iOS) Token 至資料庫，並提供觸發推播通知的 API (例如：出貨通知)。",
    "acceptance": [
      "能根據 UserID 精準推播至特定使用者的所有設備。"
    ],
    "category": "backend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "BE-303",
    "title": "強化 Auth API 區分 B2B 與 B2C 登入邏輯",
    "tag": "[微服務: Auth API (Go)]",
    "description": "更新登入端點，支援社群登入 (Google/Apple) 給一般消費者，並為企業用戶加入嚴格的信箱網域驗證。",
    "acceptance": [
      "成功核發夾帶 `role=B2B` 或 `role=B2C` 的 JWT。"
    ],
    "category": "backend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "BE-304",
    "title": "Azure Front Door WAF 防護與快取設定",
    "tag": "[基礎設施: Azure / DevOps]",
    "description": "在架構最外層部署 Azure Front Door (Standard)，開啟 Web Application Firewall (WAF) 阻擋 SQLi 與 XSS，並設定 API 回應快取。",
    "acceptance": [
      "模擬 SQL Injection 攻擊測試需收到 403 Forbidden 回應。"
    ],
    "category": "backend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "FE-301",
    "title": "開發 Potato-Partner (Web) 企業版前台",
    "tag": "[前端專案: Potato-Partner (Web)]",
    "description": "使用 Vite + React，套用沉穩的 B2B 專屬 Tailwind 企業色系。實作大宗採購購物車與審批進度條元件。",
    "acceptance": [
      "提供一鍵帶入上次採購清單的功能。",
      "部署至 Azure Static Web Apps 免費層，並掛載 B2B 專屬網域。"
    ],
    "category": "frontend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "FE-302",
    "title": "開發 Potato-Store 原生 APP 雙平台 (iOS/Android)",
    "tag": "[行動端: Potato-Store (APP)]",
    "description": "使用 Kotlin (Android) 與 Swift (iOS) 打造流暢的原生購物體驗，整合本機推播接收。",
    "acceptance": [
      "畫面切換需達 60fps 原生流暢度，無白畫面卡頓。"
    ],
    "category": "frontend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "FE-303",
    "title": "實作 APP 內建 Apple Pay 與 Google Pay",
    "tag": "[行動端: Potato-Store (APP)]",
    "description": "透過 Adyen Native SDK，於結帳頁面喚起原生的 Apple Pay (iOS) 與 Google Pay (Android) 快速結帳。",
    "acceptance": [
      "點擊 Apple Pay 按鈕需正確跳出指紋/Face ID 驗證，並將 Token 回傳給後端 Commerce API。"
    ],
    "category": "frontend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "FE-304",
    "title": "行動端 Fastlane CI/CD 自動發布腳本",
    "tag": "[基礎設施: Mobile / DevOps]",
    "description": "撰寫 Fastlane 腳本 (Ruby)，結合 Azure DevOps Pipelines，實現自動編譯 APP 並推播至 TestFlight 與 Google Play Console 內部測試軌道。",
    "acceptance": [
      "自動遞增 Build Number，開發人員不需手動上傳 IPA 或 AAB 檔案。"
    ],
    "category": "frontend",
    "phase": 3,
    "phaseTitle": "第三梯次：雙平台網頁與手機版上線"
  },
  {
    "id": "BE-401",
    "title": "開發 Live Stream API (方案 A：串接 Mux / IVS)",
    "tag": "[微服務: Live Stream API (Node.js)]",
    "description": "建立管理直播間的 API，向 Mux API 發出請求以取得 RTMP 推流網址與 HLS 播放網址。",
    "acceptance": [
      "管理員建立直播間後，能正確回傳包含 Stream Key 的 RTMP 網址供 OBS 軟體使用。",
      "使用者請求時回傳有效的 HLS (.m3u8) 播放連結。"
    ],
    "category": "backend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "BE-402",
    "title": "實作即時 WebSocket 聊天室與購物車廣播",
    "tag": "[微服務: Live Stream API (Node.js)]",
    "description": "使用 Socket.io 建立即時聊天伺服器。實作聊天室訊息的限流 (Rate Limiting) 以及「店長推播商品」的廣播事件。",
    "acceptance": [
      "需在 Azure Container Apps 設定 Sticky Sessions 以支援 WebSocket 負載平衡。",
      "單一帳號發言頻率限制每秒不可超過 2 次，違規者丟棄訊息。"
    ],
    "category": "backend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "BE-403",
    "title": "實作高併發搶購之 Redis 分散式鎖",
    "tag": "[微服務: Commerce API (Go)]",
    "description": "修改現有扣庫存邏輯，導入 Redis SETNX 鎖機制 (或 Redlock 演算法)，確保限量商品在雙十一期間不發生超賣。",
    "acceptance": [
      "使用 JMeter 發動 1,000 併發購買限量 50 件商品，最終資料庫庫存量必須精準為 0，且只有 50 筆成功訂單。"
    ],
    "category": "backend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "BE-404",
    "title": "MongoDB Atlas 慢查詢優化與索引調整",
    "tag": "[基礎設施: MongoDB Atlas / Go]",
    "description": "檢閱過去一季的慢查詢紀錄 (Slow Queries)，補齊缺失的複合索引 (Compound Index)。",
    "acceptance": [
      "所有 API 的 95th Percentile (P95) 回應時間必須小於 200ms。"
    ],
    "category": "backend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "FE-401",
    "title": "原生 APP 直播播放器 (HLS) 實作",
    "tag": "[行動端: Potato-Store (APP)]",
    "description": "在 Android 與 iOS 專案中導入原生影音播放器庫 (如 ExoPlayer / AVPlayer) 以解析並播放 Mux 傳來的 HLS 流。",
    "acceptance": [
      "支援全螢幕切換與子母畫面 (PiP) 模式，讓使用者可以邊看直播邊滑動商品。"
    ],
    "category": "frontend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "FE-402",
    "title": "網頁端與行動端之即時聊天室與購物 UI",
    "tag": "[前端專案: Potato-Store (Web & APP)]",
    "description": "開發覆蓋於播放器上的 Socket.io 聊天彈幕介面，並實作底部「熱賣商品」抽屜選單 (Bottom Sheet)。",
    "acceptance": [
      "接收到「推廣事件」時，畫面上方需彈出商品卡片，點擊可直接加入購物車。"
    ],
    "category": "frontend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "FE-403",
    "title": "網站載入效能最佳化 (Core Web Vitals)",
    "tag": "[前端專案: 所有 Web 專案]",
    "description": "利用 Vite 配置 Code Splitting，壓縮圖片資產 (轉換為 WebP)，減少首屏 Bundle Size，提升 LCP 與 CLS 分數。",
    "acceptance": [
      "Google Lighthouse 首頁效能評分必須達到 85 分以上。"
    ],
    "category": "frontend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "FE-404",
    "title": "前端錯誤收集與監控 (Sentry/Application Insights) 整合",
    "tag": "[前端專案: 所有 Web & APP]",
    "description": "導入錯誤追蹤 SDK，捕獲前端 JavaScript 崩潰與 API 非預期例外錯誤，統一發送至儀表板。",
    "acceptance": [
      "發生 Error Boundary 捕獲的崩潰時，能附帶使用者的 Session 與 Browser 資訊回傳至後台。"
    ],
    "category": "frontend",
    "phase": 4,
    "phaseTitle": "第四梯次：效能強化與直播導入"
  },
  {
    "id": "BE-501",
    "title": "資料庫 Multi-tenant 綱要重構與遷移",
    "tag": "[基礎設施: MongoDB Atlas / Go]",
    "description": "更新所有 Collections (Orders, Inventories, Staff) 加入強制的 `tenant_id` 欄位。撰寫 Migration 腳本將現有資料歸屬至預設的第一間門市 (Tenant 1)。",
    "acceptance": [
      "所有資料表讀寫操作，若未傳入 Tenant ID，必須噴出 Panic 或拒絕執行。"
    ],
    "category": "backend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "BE-502",
    "title": "實作全域與區域 (Global vs Local) 庫存調撥邏輯",
    "tag": "[微服務: Ops API (Go)]",
    "description": "開發跨租戶的庫存轉移 (Inventory Transfer) API，支援總倉調配庫存至各分店，並記錄詳細的調撥歷程。",
    "acceptance": [
      "調撥過程需使用 MongoDB Transaction，確保出庫與入庫的數字一致且原子性。"
    ],
    "category": "backend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "BE-503",
    "title": "建立自動化新租戶開通腳本 (Tenant Onboarding)",
    "tag": "[基礎設施: DevOps / Go]",
    "description": "開發一套自動化流程，當新門市或新廠區成立時，一鍵生成預設角色、設定檔、並開通獨立的資源與報告。",
    "acceptance": [
      "開通新廠區的時間需小於 30 秒，且新管理員能立即登入並擁有該廠區最高權限。"
    ],
    "category": "backend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "BE-504",
    "title": "API 路由與 JWT 驗證層級改造",
    "tag": "[微服務: Auth API (Go)]",
    "description": "更新 JWT 的 Payload，使其包含該員工所屬的授權廠區陣列 `allowed_tenants: [1, 2]`。更新 Middleware 進行比對。",
    "acceptance": [
      "若員工嘗試透過 API 存取未授權廠區的資料，必須嚴格阻擋並回傳 403 Forbidden。"
    ],
    "category": "backend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "FE-501",
    "title": "總部與門市上下文切換 (Context Switcher) UI",
    "tag": "[前端專案: Potato-Control (Web & APP)]",
    "description": "在後台導覽列實作一個下拉式選單，允許具備多廠區權限的區主管/總經理，快速切換當前的操作租戶 (Tenant Context)。",
    "acceptance": [
      "切換租戶後，全局狀態 (Zustand/Context) 更新，並自動清除舊租戶的 React Query 快取，觸發畫面重新渲染。"
    ],
    "category": "frontend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "FE-502",
    "title": "多租戶資料整合數據看板 (Multi-tenant Dashboard)",
    "tag": "[前端專案: Potato-Control (Web)]",
    "description": "開發總經理專用的全域儀表板，整合各廠區的營收、庫存健康度與熱銷商品排行，使用 Recharts 或 Chart.js 進行視覺化。",
    "acceptance": [
      "支援圖表鑽取 (Drill-down)，點擊特定門市柱狀圖可跳轉至該門市的詳細數據頁面。"
    ],
    "category": "frontend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "FE-503",
    "title": "POS APP 綁定廠區與裝置註冊流程",
    "tag": "[行動端: Potato-Control (APP)]",
    "description": "在新廠區啟用新平板時，實作初次開機的「綁定廠區/裝置註冊」精靈 (Wizard)，掃描 QR Code 即可自動帶入對應的 Tenant ID 與設定檔。",
    "acceptance": [
      "綁定成功後需將配置鎖死在設備中，一般員工無法任意解除綁定或切換。"
    ],
    "category": "frontend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "FE-504",
    "title": "B2C 與 B2B 客戶端支援多門市自取選擇",
    "tag": "[前端專案: Store & Partner (Web/APP)]",
    "description": "修改購物結帳流程，若使用者選擇「實體店自取」，能列出附近有庫存的廠區/門市，並顯示該店的營業時間。",
    "acceptance": [
      "若該門市特定商品缺貨，該門市選項須標示為反灰 (Disabled)，並提示「庫存不足」。"
    ],
    "category": "frontend",
    "phase": 5,
    "phaseTitle": "第五梯次：可規模化複製系統 (SaaS 化)"
  },
  {
    "id": "BE-601",
    "title": "正式導入 Azure API Management 基礎架構",
    "tag": "[基礎設施: Azure APIM]",
    "description": "部署 Azure API Management，設定將外部 API 路由轉發至內部的 Azure Container Apps 微服務叢集。",
    "acceptance": [
      "所有來自外部的直接存取內部微服務請求必須被擋下，只允許經由 APIM 的流量。"
    ],
    "category": "backend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "BE-602",
    "title": "實作 APIM 限流政策 (Policies) 與金鑰管理",
    "tag": "[基礎設施: Azure APIM]",
    "description": "撰寫 APIM Policies XML，針對不同等級的訂閱帳號設定不同的 API 呼叫配額 (Quota) 與速率限制 (Rate limit)。",
    "acceptance": [
      "免費測試帳號每分鐘限制 60 次呼叫，超過回傳 `429 Too Many Requests`。"
    ],
    "category": "backend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "BE-603",
    "title": "OpenAPI (Swagger) 文件標準化與自動生成",
    "tag": "[微服務: 全體 Go 微服務]",
    "description": "在 Go 程式碼中補齊 Swag 註解，由 CI/CD 流程自動產生 OpenAPI Specification JSON 並同步更新至 APIM 的 Developer Portal。",
    "acceptance": [
      "每個開放的 Endpoint 必須附帶 Request Example 與 Response Schema 說明。"
    ],
    "category": "backend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "BE-604",
    "title": "實作外部 Webhook 訂閱與推送機制",
    "tag": "[微服務: Ops API (Go) / Event Hubs]",
    "description": "允許外部夥伴註冊他們的 URL Endpoint，當「訂單狀態更新」或「庫存變動」時，系統主動打 Webhook 通知對方。",
    "acceptance": [
      "發送 Webhook 時需附帶 HMAC 簽章讓夥伴驗證來源。",
      "若對方伺服器無回應，需具備 Exponential Backoff 重試機制。"
    ],
    "category": "backend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "FE-601",
    "title": "開發者入口網站 (Developer Portal) 佈景客製化",
    "tag": "[前端專案: Azure APIM Portal]",
    "description": "利用 Azure APIM 內建的開發者入口網站，套用土豆商城的品牌視覺 (CSS) 與排版，提供無縫的體驗。",
    "acceptance": [
      "入口網站需具備自適應網頁設計 (RWD)，且色彩對比度符合無障礙規範 (WCAG)。"
    ],
    "category": "frontend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "FE-602",
    "title": "後台新增「開發者金鑰管理」與「配額檢視」介面",
    "tag": "[前端專案: Potato-Control (Web)]",
    "description": "在內部營運後台中，新增管理頁面以審核外部廠商的 API 申請，並視覺化顯示他們的 API 呼叫用量 (Chart.js)。",
    "acceptance": [
      "管理員可以一鍵撤銷 (Revoke) 異常暴增流量的金鑰。"
    ],
    "category": "frontend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "FE-603",
    "title": "實作互動式 API 測試終端 (API Console)",
    "tag": "[前端專案: Developer Portal]",
    "description": "在開發者入口整合 Swagger UI 或類似套件，讓開發者能在網頁上直接填入參數發送測試請求。",
    "acceptance": [
      "測試請求需預設帶入使用者的測試金鑰 (Sandbox Key)，不可誤觸正式環境。"
    ],
    "category": "frontend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "FE-604",
    "title": "外部 Webhook 註冊與日誌檢視 UI",
    "tag": "[前端專案: Potato-Partner (Web)]",
    "description": "在 B2B 的企業後台中，新增區塊讓外部廠商自行輸入 Webhook 接收網址，並顯示最近 100 筆推送紀錄與成功/失敗狀態。",
    "acceptance": [
      "需具備重新發送 (Retry) 單筆 Webhook 事件的按鈕。"
    ],
    "category": "frontend",
    "phase": 6,
    "phaseTitle": "第六梯次：對外開放系統 (Open API)"
  },
  {
    "id": "BE-701",
    "title": "MongoDB Atlas 讀寫分離與分片 (Sharding) 工程",
    "tag": "[基礎設施: MongoDB Atlas / Go]",
    "description": "設定 MongoDB 副本集處理唯讀查詢。針對訂單與日誌 Collection 實作基於 `tenant_id` 或 `date` 的分片鍵 (Shard Key) 策略。",
    "acceptance": [
      "寫入吞吐量 (Throughput) 需提升至原先的 3 倍以上。"
    ],
    "category": "backend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "BE-702",
    "title": "開發 Background Worker 處理耗時任務",
    "tag": "[微服務: Ops Worker (Go)]",
    "description": "將報表生成 (PDF/Excel)、大量信件寄送等耗時任務從主 API 解耦。透過 Azure Service Bus Queue 觸發獨立的背景容器 (Worker) 執行。",
    "acceptance": [
      "API 接收報表請求後立即回傳 HTTP 202 Accepted，待 Worker 處理完畢後發送 WebSocket 通知使用者下載。"
    ],
    "category": "backend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "BE-703",
    "title": "建立 Node.js BFF (Backend-For-Frontend) 層",
    "tag": "[微服務: Gateway BFF (Node.js)]",
    "description": "實作 BFF 節點。當前端請求「首頁」時，BFF 負責併發呼叫 Commerce API 與 Ops API，並將結果聚合 (Aggregate) 成單一 JSON 回傳。",
    "acceptance": [
      "前端首頁載入時的網路 Request 數量需減少 50% 以上。"
    ],
    "category": "backend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "BE-704",
    "title": "Redis Cluster 快取分片與高可用性設定",
    "tag": "[基礎設施: Azure Redis]",
    "description": "升級 Azure Cache for Redis 至標準或進階層級，啟用 Cluster 模式以突破單點記憶體限制。",
    "acceptance": [
      "單點節點模擬故障時，快取系統能自動切換 (Failover) 而不中斷連線。"
    ],
    "category": "backend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "FE-701",
    "title": "前端網路請求重構 (串接 BFF)",
    "tag": "[前端專案: 包含 APP 在內的所有前端]",
    "description": "修改 Axios/Fetch 的請求路徑，將原先分散打向多個微服務的請求，統一改為呼叫新的 BFF Endpoint。",
    "acceptance": [
      "前端介面無須做大幅度調整，但載入速度 (FCP) 需有肉眼可見的提升。"
    ],
    "category": "frontend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "FE-702",
    "title": "長輪詢與 WebSocket 非同步任務進度條",
    "tag": "[前端專案: Potato-Control (Web)]",
    "description": "配合 [BE-702] 的背景任務，在後台實作全局的「任務處理中心」UI，顯示匯出報表的即時進度百分比。",
    "acceptance": [
      "任務完成時需跳出系統通知並提供檔案下載按鈕。"
    ],
    "category": "frontend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "FE-703",
    "title": "APP 端 GraphQL 介接預先評估 (Spike)",
    "tag": "[行動端: Potato-Store (APP)]",
    "description": "(研究任務) 探討在 BFF 層引入 GraphQL 以取代 REST API 的效益，製作一個小型的 Proof of Concept (PoC) 在 APP 內執行。",
    "acceptance": [
      "提交一份比較 REST BFF 與 GraphQL BFF 的傳輸負載分析報告。"
    ],
    "category": "frontend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "FE-704",
    "title": "前端靜態資源 CDN 多節點壓力測試",
    "tag": "[基礎設施: DevOps / Frontend]",
    "description": "使用自動化壓測腳本模擬全球不同地區的網路節點訪問，驗證 Azure Static Web Apps 與 CDN 快取的命中率與延遲。",
    "acceptance": [
      "確保全球主要服務區的靜態資源下載時間皆低於 1.5 秒。"
    ],
    "category": "frontend",
    "phase": 7,
    "phaseTitle": "第七梯次：高併發可擴展系統"
  },
  {
    "id": "BE-801",
    "title": "3D 模型與素材管理 API",
    "tag": "[微服務: Ops API (Go)]",
    "description": "擴充產品型錄功能，支援上傳 `.gltf` 與 `.usdz` 檔案至 Azure Blob Storage，並於 MongoDB Atlas 關聯。",
    "acceptance": [
      "上傳 API 需驗證檔案副檔名與大小 (不得超過 20MB)。",
      "回傳的 API Response 中需包含 `model_3d_url` 欄位供前端取用。"
    ],
    "category": "backend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  },
  {
    "id": "BE-802",
    "title": "擴充 BFF 層以支援場景初始化資料 (Scene Data)",
    "tag": "[微服務: Gateway BFF (Node.js)]",
    "description": "為 WebXR 網頁提供專屬的場景初始化 API，一次性回傳虛擬展間座標矩陣 (Transform Matrix) 與關聯商品。",
    "acceptance": [
      "資料需經過高度壓縮與 Redis 快取，回應時間需極低。"
    ],
    "category": "backend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  },
  {
    "id": "BE-803",
    "title": "實作 VR 空間中的多人互動/看見彼此 (PoC)",
    "tag": "[微服務: Live Stream API (Node.js)]",
    "description": "(可選) 擴展原有的 WebSocket 服務，廣播同一展間內其他消費者的簡易座標 (Avatar Position)，打造元宇宙的共鳴感。",
    "acceptance": [
      "位置廣播必須具備節流 (Throttling) 機制，例如每秒只廣播 5 次座標，避免壓垮伺服器。"
    ],
    "category": "backend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  },
  {
    "id": "BE-804",
    "title": "3D 模型轉檔排程 Worker",
    "tag": "[微服務: Ops Worker (Go)]",
    "description": "撰寫背景工作腳本，當使用者上傳高精度的原始 3D 模型時，在背景自動呼叫第三方 API 或命令列工具進行壓縮減面。",
    "acceptance": [
      "自動產生一個小於 5MB 的 Web-optimized 版本供網頁端載入。"
    ],
    "category": "backend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  },
  {
    "id": "FE-801",
    "title": "WebXR 虛擬展間搭建 (Three.js / React Three Fiber)",
    "tag": "[前端專案: Potato-Store (Web)]",
    "description": "導入 `@react-three/fiber`，在網頁上渲染出 3D 商場場景，實作第一人稱視角移動邏輯。",
    "acceptance": [
      "在配備中高階顯卡的電腦上，需維持穩定的 60 FPS 幀率。"
    ],
    "category": "frontend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  },
  {
    "id": "FE-802",
    "title": "實作 3D 物件點擊與「加入購物車」互動",
    "tag": "[前端專案: Potato-Store (Web)]",
    "description": "利用 Raycaster 偵測使用者的滑鼠點擊/螢幕觸控，當擊中 3D 產品時跳出該商品的詳細規格與價格。",
    "acceptance": [
      "點擊 3D 空間中的「購買」按鈕後，需能正確更新外部 React 元件的 Zustand 購物車狀態。"
    ],
    "category": "frontend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  },
  {
    "id": "FE-803",
    "title": "原生 APP 整合 ARKit / ARCore (AR 檢視)",
    "tag": "[行動端: Potato-Store (APP)]",
    "description": "在 Android 與 iOS 平台中，開發「在您的空間預覽」功能，呼叫原生的 AR 套件檢視實體大小。",
    "acceptance": [
      "iOS 成功載入 `.usdz` 檔案並喚起 Quick Look。Android 成功載入 `.gltf` 檔案。"
    ],
    "category": "frontend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  },
  {
    "id": "FE-804",
    "title": "VR 模式效能降級與防呆處理",
    "tag": "[前端專案: Potato-Store (Web)]",
    "description": "實作進場前的硬體偵測，以及加載 3D 資源時的百分比進度條 (Loading Screen)。",
    "acceptance": [
      "若瀏覽器不支援 WebGL 或效能過低，必須平滑引導使用者回到標準 2D 商品列表頁面。"
    ],
    "category": "frontend",
    "phase": 8,
    "phaseTitle": "第八梯次：VR 版商場體驗"
  }
];
