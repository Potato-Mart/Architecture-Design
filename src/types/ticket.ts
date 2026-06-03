export type TicketCategory = 'backend' | 'frontend';

export interface Ticket {
  id: string;
  title: string;
  tag: string;
  description: string;
  acceptance: string[];
  category: TicketCategory;
  phase: number;
  phaseTitle: string;
  status?: string;
  priority?: string;
  uploadedToGithub?: boolean;
  githubIssueNumber?: number;
  githubIssueUrl?: string;
}

export interface TicketInput {
  id: string;
  title: string;
  tag: string;
  description: string;
  acceptance: string[];
  category: TicketCategory;
  phase: number;
  phaseTitle?: string;
  status?: string;
  priority?: string;
}

export interface BulkTicketUploadResult {
  tickets: Ticket[];
  createdCount: number;
  skippedCount?: number;
  errors: string[];
}
