import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BulkTicketUploadResult, Ticket, TicketCategory, TicketInput } from '../types/ticket';

type UnknownRecord = Record<string, unknown>;

const DEFAULT_API_BASE_URL = '/api';
const DEFAULT_ISSUES_ENDPOINT = '/issues';

const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);
const issuesEndpoint = normalizePath(
  import.meta.env.VITE_ISSUES_ENDPOINT
    ?? import.meta.env.VITE_TICKETS_ENDPOINT
    ?? DEFAULT_ISSUES_ENDPOINT,
);
const issueDetailEndpoint =
  import.meta.env.VITE_ISSUE_DETAIL_ENDPOINT ?? import.meta.env.VITE_TICKET_DETAIL_ENDPOINT;
const issueSyncEndpoint = import.meta.env.VITE_ISSUE_SYNC_ENDPOINT;
const issuesBulkEndpoint = normalizePath(import.meta.env.VITE_ISSUES_BULK_ENDPOINT ?? '/issues/bulk');
const issuesBulkBodyKey = import.meta.env.VITE_ISSUES_BULK_BODY_KEY?.trim();

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ticketKeys = {
  all: ['tickets'] as const,
  list: () => [...ticketKeys.all, 'list'] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
};

export async function fetchTickets(): Promise<Ticket[]> {
  // Use the "current" endpoint which returns the full active ticket set
  // (unpaginated) so the UI can filter and paginate across every ticket.
  const payload = await requestJson(`${issuesEndpoint}/current`);
  return normalizeTicketsResponse(payload);
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const payload = await requestJson(buildTicketDetailPath(id));
  return normalizeTicketDetailResponse(payload);
}

export async function createTicket(input: TicketInput): Promise<Ticket> {
  const payload = await requestJson(issuesEndpoint, {
    method: 'POST',
    body: input,
  });
  return normalizeTicketDetailResponse(payload);
}

export async function bulkCreateTickets(inputs: TicketInput[]): Promise<BulkTicketUploadResult> {
  const payload = await requestJson(issuesBulkEndpoint, {
    method: 'POST',
    body: buildBulkUploadBody(inputs),
  });
  return normalizeBulkTicketUploadResponse(payload);
}

export async function bulkUploadCsvFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<BulkTicketUploadResult> {
  const url = buildUrl(issuesBulkEndpoint);
  const formData = new FormData();
  formData.append('file', file);

  const payload = await new Promise<unknown>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve(xhr.response);
        return;
      }
      const body = xhr.response as { message?: unknown; code?: unknown } | null;
      const message =
        (body && typeof body.message === 'string' && body.message) ||
        (body && typeof body.code === 'string' && body.code) ||
        `API request failed with ${xhr.status}`;
      reject(new ApiError(message, xhr.status));
    };

    xhr.onerror = () => reject(new ApiError('Network error during upload', 0));
    xhr.send(formData);
  });

  return normalizeBulkTicketUploadResponse(payload);
}

export async function syncTicketToGithub(id: string): Promise<Ticket> {
  const payload = await requestJson(buildTicketSyncPath(id), {
    method: 'POST',
  });
  return normalizeTicketDetailResponse(payload);
}

export function useTicketsQuery() {
  return useQuery({
    queryKey: ticketKeys.list(),
    queryFn: fetchTickets,
  });
}

export function useTicketQuery(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ticketKeys.detail(id),
    enabled: id.length > 0,
    queryFn: async () => {
      try {
        return await fetchTicketById(id);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          throw error;
        }

        const cachedTickets = queryClient.getQueryData<Ticket[]>(ticketKeys.list());
        const cachedTicket = cachedTickets?.find((ticket) => ticket.id === id);
        if (cachedTicket) return cachedTicket;

        const tickets = await queryClient.fetchQuery({
          queryKey: ticketKeys.list(),
          queryFn: fetchTickets,
        });
        const ticket = tickets.find((item) => item.id === id);
        if (!ticket) throw error;
        return ticket;
      }
    },
  });
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.setQueryData<Ticket[]>(ticketKeys.list(), (current = []) => {
        const exists = current.some((item) => item.id === ticket.id);
        return exists
          ? current.map((item) => (item.id === ticket.id ? ticket : item))
          : [ticket, ...current];
      });
      queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.list() });
    },
  });
}

export function useBulkCreateTicketsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCreateTickets,
    onSuccess: (result) => {
      queryClient.setQueryData<Ticket[]>(ticketKeys.list(), (current = []) => {
        const byId = new Map(current.map((ticket) => [ticket.id, ticket]));
        for (const ticket of result.tickets) {
          byId.set(ticket.id, ticket);
          queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
        }
        return Array.from(byId.values());
      });
      void queryClient.invalidateQueries({ queryKey: ticketKeys.list() });
    },
  });
}

export function useBulkUploadCsvMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) =>
      bulkUploadCsvFile(file, onProgress),
    onSuccess: (result) => {
      queryClient.setQueryData<Ticket[]>(ticketKeys.list(), (current = []) => {
        const byId = new Map(current.map((ticket) => [ticket.id, ticket]));
        for (const ticket of result.tickets) {
          byId.set(ticket.id, ticket);
          queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
        }
        return Array.from(byId.values());
      });
      void queryClient.invalidateQueries({ queryKey: ticketKeys.list() });
    },
  });
}

export function useSyncTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncTicketToGithub,
    onSuccess: (ticket) => {
      queryClient.setQueryData<Ticket[]>(ticketKeys.list(), (current = []) =>
        current.map((item) => (item.id === ticket.id ? ticket : item)),
      );
      queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.list() });
    },
  });
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

async function requestJson(path: string, options: RequestOptions = {}): Promise<unknown> {
  const response = await fetch(buildUrl(path), {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(`API request failed with ${response.status}`, response.status);
  }

  return response.json();
}

function buildTicketDetailPath(id: string) {
  const encodedId = encodeURIComponent(id);
  if (issueDetailEndpoint) {
    return issueDetailEndpoint.replace(':id', encodedId).replace('{id}', encodedId);
  }
  return `${issuesEndpoint}/${encodedId}`;
}

function buildTicketSyncPath(id: string) {
  const encodedId = encodeURIComponent(id);
  if (issueSyncEndpoint) {
    return issueSyncEndpoint.replace(':id', encodedId).replace('{id}', encodedId);
  }
  return `${issuesEndpoint}/${encodedId}/sync`;
}

function buildBulkUploadBody(inputs: TicketInput[]) {
  return issuesBulkBodyKey ? { [issuesBulkBodyKey]: inputs } : inputs;
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!apiBaseUrl) return path;
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeBaseUrl(value: string) {
  if (value === '/') return '';
  return value.replace(/\/+$/, '');
}

function normalizePath(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function normalizeTicketsResponse(payload: unknown) {
  const items = unwrapArray(payload);
  return items.map(normalizeTicket).filter((ticket): ticket is Ticket => ticket !== null);
}

function normalizeTicketDetailResponse(payload: unknown) {
  const candidate = unwrapRecord(payload);
  const ticket = normalizeTicket(candidate);
  if (!ticket) {
    throw new ApiError('Ticket response did not match the expected shape', 500);
  }
  return ticket;
}

function normalizeBulkTicketUploadResponse(payload: unknown): BulkTicketUploadResult {
  const tickets = normalizeTicketsResponse(payload);
  const record = isRecord(payload) ? payload : {};
  const errors = toStringList(firstDefined(record.errors, record.errorMessages, record.error_messages));
  const createdCount = toNumber(
    firstDefined(record.createdCount, record.created_count, record.insertedCount, record.inserted_count),
  );
  const skippedCount = toNumber(
    firstDefined(record.skippedCount, record.skipped_count, record.duplicateCount, record.duplicate_count),
  );

  return {
    tickets,
    createdCount: createdCount ?? tickets.length,
    skippedCount,
    errors,
  };
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];

  const arrayKeys = ['tickets', 'items', 'data', 'results', 'content'];
  for (const key of arrayKeys) {
    const child = value[key];
    if (Array.isArray(child)) return child;
    if (isRecord(child)) {
      const nested = unwrapArray(child);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function unwrapRecord(value: unknown): unknown {
  if (!isRecord(value)) return value;

  const recordKeys = ['ticket', 'data', 'item', 'result'];
  for (const key of recordKeys) {
    const child = value[key];
    if (isRecord(child)) return child;
  }

  return value;
}

function normalizeTicket(value: unknown): Ticket | null {
  if (!isRecord(value)) return null;

  const id = toText(firstDefined(value.id, value.ticketId, value.ticket_id, value.code, value.key));
  const title = toText(firstDefined(value.title, value.name, value.summary));
  if (!id || !title) return null;

  const phase = toNumber(
    firstDefined(value.phase, value.phaseNumber, value.phase_number, value.phaseId, value.phase_id),
  ) ?? inferPhaseFromId(id);

  return {
    id,
    title,
    tag: toText(firstDefined(value.tag, value.label, value.area, value.component)),
    description: toText(firstDefined(value.description, value.body, value.details, value.content)),
    acceptance: toStringList(
      firstDefined(value.acceptance, value.acceptanceCriteria, value.acceptance_criteria, value.criteria),
    ),
    category: normalizeCategory(firstDefined(value.category, value.type, value.kind), id),
    phase,
    phaseTitle: toText(firstDefined(value.phaseTitle, value.phase_title)) || `Phase ${phase}`,
    status: optionalText(firstDefined(value.status, value.state)),
    priority: optionalText(value.priority),
    uploadedToGithub: normalizeGithubSyncState(value),
    githubIssueNumber: toNumber(
      firstDefined(value.githubIssueNumber, value.github_issue_number, value.issueNumber, value.issue_number),
    ),
    githubIssueUrl: optionalText(
      firstDefined(value.githubIssueUrl, value.github_issue_url, value.htmlUrl, value.html_url),
    ),
  };
}

function normalizeGithubSyncState(value: UnknownRecord) {
  const explicit = firstDefined(
    value.uploadedToGithub,
    value.uploaded_to_github,
    value.githubSynced,
    value.github_synced,
    value.syncedToGithub,
    value.synced_to_github,
  );

  if (typeof explicit === 'boolean') return explicit;
  if (typeof explicit === 'string') return ['true', 'yes', 'synced', 'uploaded'].includes(explicit.toLowerCase());

  return Boolean(
    firstDefined(value.githubIssueNumber, value.github_issue_number, value.issueNumber, value.issue_number)
      ?? firstDefined(value.githubIssueUrl, value.github_issue_url, value.htmlUrl, value.html_url),
  );
}

function normalizeCategory(value: unknown, id: string): TicketCategory {
  const text = toText(value).toLowerCase();
  if (text.includes('front') || id.toUpperCase().startsWith('FE-')) return 'frontend';
  return 'backend';
}

function inferPhaseFromId(id: string) {
  const match = id.match(/-(\d{3})/);
  if (!match) return 0;
  return Math.floor(Number(match[1]) / 100);
}

function toStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }

  const text = toText(value);
  if (!text) return [];

  return text
    .split(/\r?\n|;\s*/)
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function optionalText(value: unknown) {
  const text = toText(value);
  return text || undefined;
}

function toText(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
