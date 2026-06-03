/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ISSUES_ENDPOINT?: string;
  readonly VITE_ISSUE_DETAIL_ENDPOINT?: string;
  readonly VITE_ISSUE_SYNC_ENDPOINT?: string;
  readonly VITE_ISSUES_BULK_ENDPOINT?: string;
  readonly VITE_ISSUES_BULK_BODY_KEY?: string;
  readonly VITE_TICKETS_ENDPOINT?: string;
  readonly VITE_TICKET_DETAIL_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
