# 土豆商城架構藍圖 (Potato Mart Architecture)

互動式架構與開發藍圖網站，內容來自本專案 `docs/` 內的 HTML 文件。
以 **Vite + React + TypeScript + Tailwind CSS + TanStack (Router & Query)** 重新設計。

## 頁面結構

| 路徑 | 內容 |
| --- | --- |
| `/` | 總覽首頁 — 包含完整的互動式全景系統架構、里程碑與梯次總覽 |
| `/architecture` | 互動式系統拓樸圖，點擊節點檢視技術選型與防護設定 |
| `/phases` | 開發梯次 (Phases) 列表 |
| `/phases/$slug` | 各梯次詳情：核心目標、潛在風險、改進策略與完整任務清單 |
| `/tickets` | 全部 Backlog Tickets，可搜尋與依分類/梯次篩選 |
| `/tickets/$id` | 單一任務詳情，含驗收標準 |
| `/about` | 關於本藍圖與技術選型 |

- **Tickets** (`/tickets`) = 全部任務
- **Phases** (`/phases`) = 各開發梯次

> 已移除原模板的 Auth (login / register / reset password)、Pricing、Customers、Support center、Apps 等頁面。

## 開發

```bash
npm install
npm run dev      # 啟動開發伺服器 (http://localhost:5173)
npm run build    # 型別檢查 + 產出 production 版本至 dist/
npm run preview  # 預覽 production build
```

## 資料來源

頁面資料由 `docs/phase*.html` 自動解析而來：

```bash
python scripts/parse_docs.py
```

會產出：
- `src/data/phases.ts` — 各梯次的目標/風險/改進與任務 (供 Phases 頁面使用)
- `src/data/tickets.ts` — 攤平的全部任務 (供 Tickets 頁面使用)

`src/data/architecture.ts` 則為全景架構拓樸圖的節點資料 (移植自 `docs/architecture.html`)。

## 資產

- `public/logo.png` — 網站 Logo
- `public/logo.ico` — 瀏覽器分頁圖示 (favicon)

## 安全性 (Security)

部署於 Netlify，所有安全標頭與 SPA 路由 fallback 皆定義於 [`netlify.toml`](./netlify.toml)：

- **Content-Security-Policy** — 嚴格鎖定同源 (`default-src 'self'`)，並設定 `script-src 'self'`、`style-src 'self'`、`object-src 'none'`、`frame-ancestors 'none'`、`base-uri 'self'`、`upgrade-insecure-requests`。本站不使用任何第三方來源 (Inter 字型已自架，無外部 script/API)。
- **HSTS** (`Strict-Transport-Security`) — 強制 HTTPS。
- **X-Frame-Options: DENY** + `frame-ancestors 'none'` — 防點擊劫持 (clickjacking)。
- **X-Content-Type-Options: nosniff** — 防 MIME 嗅探。
- **Referrer-Policy** 與 **Permissions-Policy** — 限制 referrer 外洩並關閉未使用的瀏覽器功能 (相機、麥克風、地理位置等)。
- **Cross-Origin-Opener-Policy / Resource-Policy** — 跨來源隔離。

設計上的安全特性：

- 純靜態、唯讀網站；無後端、無登入、無使用者輸入或表單送出。
- 全程未使用 `dangerouslySetInnerHTML` / `innerHTML` / `eval`，無動態 HTML 注入面。
- 字型自架 (`@fontsource-variable/inter`)，不向第三方發出任何請求 (隱私 + 可套用最嚴格 CSP)。

相依套件：已升級至 **Vite 8**，修補先前 `esbuild` 開發伺服器的 advisory (GHSA-67mh-4wv8-2f99)。`npm audit` 目前回報 **0 個弱點**。
