import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PageHeader } from '../components/PageHeader';
import { TicketCard } from '../components/TicketCard';
import { phases } from '../data/phases';
import {
  useBulkUploadCsvMutation,
  useCreateTicketMutation,
  useSyncTicketMutation,
  useTicketsQuery,
} from '../api/tickets';
import type { TicketCategory, TicketInput } from '../types/ticket';

type CategoryFilter = 'all' | TicketCategory;
type TicketTab = 'browse' | 'upload';
type UploadMode = 'single' | 'bulk';

const PAGE_SIZE = 12;

interface TicketFormState {
  id: string;
  title: string;
  tag: string;
  description: string;
  acceptance: string;
  category: TicketCategory;
  phase: string;
  priority: string;
}

const initialFormState: TicketFormState = {
  id: '',
  title: '',
  tag: '',
  description: '',
  acceptance: '',
  category: 'frontend',
  phase: '1',
  priority: '',
};

export function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TicketTab>('browse');
  const [uploadMode, setUploadMode] = useState<UploadMode>('single');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [phase, setPhase] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<TicketFormState>(initialFormState);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bulkFileError, setBulkFileError] = useState<string | null>(null);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);
  const [syncingTicketId, setSyncingTicketId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: tickets = [], error, isError, isLoading } = useTicketsQuery();
  const createTicket = useCreateTicketMutation();
  const bulkUploadCsv = useBulkUploadCsvMutation();
  const syncTicket = useSyncTicketMutation();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (category !== 'all' && ticket.category !== category) return false;
      if (phase !== 'all' && ticket.phase !== phase) return false;
      if (q) {
        const haystack = `${ticket.id} ${ticket.title} ${ticket.tag} ${ticket.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, query, category, phase]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  // Reset to the first page whenever the filters change the result set.
  useEffect(() => {
    setPage(1);
  }, [query, category, phase]);

  const unsyncedCount = tickets.filter((ticket) => !ticket.uploadedToGithub).length;

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phaseNumber = Number(form.phase);
    const phaseTitle = phases.find((item) => item.phase === phaseNumber)?.title;
    const payload: TicketInput = {
      id: form.id.trim(),
      title: form.title.trim(),
      tag: form.tag.trim(),
      description: form.description.trim(),
      acceptance: form.acceptance
        .split(/\r?\n/)
        .map((item) => item.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean),
      category: form.category,
      phase: phaseNumber,
      phaseTitle,
      priority: form.priority.trim() || undefined,
      status: 'Todo',
    };

    try {
      await createTicket.mutateAsync(payload);
      setForm(initialFormState);
      setActiveTab('browse');
    } catch {
      // The mutation error state renders the API message below the form.
    }
  }

  function selectCsvFile(file: File | null) {
    setBulkSuccessMessage(null);
    setBulkFileError(null);
    setUploadProgress(0);

    if (!file) {
      setCsvFile(null);
      return;
    }

    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
    if (!isCsv) {
      setCsvFile(null);
      setBulkFileError('Please choose a .csv file.');
      return;
    }

    setCsvFile(file);
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectCsvFile(event.target.files?.[0] ?? null);
    // Allow re-selecting the same file later.
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectCsvFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleBulkUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBulkSuccessMessage(null);
    setBulkFileError(null);

    if (!csvFile) {
      setBulkFileError('Choose a CSV file to upload.');
      return;
    }

    setUploadProgress(0);

    try {
      const result = await bulkUploadCsv.mutateAsync({
        file: csvFile,
        onProgress: setUploadProgress,
      });
      setBulkSuccessMessage(
        `Uploaded ${result.createdCount} tickets${result.skippedCount ? `, skipped ${result.skippedCount}` : ''}.`,
      );
      setCsvFile(null);
      setActiveTab('browse');
    } catch {
      // The mutation error state renders the API message below the form.
    }
  }

  function handleSync(ticketId: string) {
    setSyncingTicketId(ticketId);
    syncTicket.mutate(ticketId, {
      onSettled: () => setSyncingTicketId(null),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Backlog Tickets"
        subtitle={`Live issue data from the backend API. ${isLoading ? 'Loading...' : `${tickets.length} tickets, ${unsyncedCount} waiting for GitHub sync.`}`}
        badge={{ label: 'Tickets', className: 'badge-purple' }}
      />

      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {([
          ['browse', 'Browse tickets'],
          ['upload', 'Upload ticket'],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-brand-gradient text-ink'
                : 'border border-white/15 text-slate-300 hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'browse' ? (
        <>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ticket ID, title, tag, or description..."
              className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary lg:max-w-md"
            />
            <div className="flex flex-wrap gap-2">
              {(['all', 'backend', 'frontend'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    category === item
                      ? 'bg-brand-gradient text-ink'
                      : 'border border-white/15 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {item === 'all' ? 'All' : item}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPhase('all')}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                phase === 'all' ? 'bg-white/10 text-primary' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              All phases
            </button>
            {phases.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setPhase(item.phase)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  phase === item.phase ? 'bg-white/10 text-primary' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                Phase {item.phase}
              </button>
            ))}
          </div>

          <p className="mb-6 text-sm text-slate-400">
            {isLoading
              ? 'Matching tickets: ...'
              : filtered.length > 0
                ? `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} matching tickets`
                : 'Matching tickets: 0'}
          </p>

          {isLoading ? (
            <div className="card text-center text-slate-400">Loading tickets from the API...</div>
          ) : isError ? (
            <div className="card text-center text-red-200">
              Ticket API request failed{error instanceof Error ? `: ${error.message}` : '.'}
            </div>
          ) : filtered.length > 0 ? (
            <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((ticket) => (
                <div key={ticket.id} className="space-y-3">
                  <TicketCard ticket={ticket} />
                  {!ticket.uploadedToGithub ? (
                    <button
                      type="button"
                      onClick={() => handleSync(ticket.id)}
                      disabled={syncTicket.isPending && syncingTicketId === ticket.id}
                      className="w-full rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {syncTicket.isPending && syncingTicketId === ticket.id
                        ? 'Syncing to GitHub...'
                        : 'Sync to GitHub'}
                    </button>
                  ) : ticket.githubIssueUrl ? (
                    <a
                      href={ticket.githubIssueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-white/15 px-3 py-2 text-center text-sm text-slate-300 transition hover:bg-white/5 hover:text-primary"
                    >
                      Open GitHub issue
                    </a>
                  ) : null}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="card text-center text-slate-400">No tickets match the current filters.</div>
          )}
        </>
      ) : (
        <>
          <div className="mx-auto mb-6 flex max-w-3xl flex-wrap gap-2">
            {([
              ['single', 'Single ticket'],
              ['bulk', 'Bulk upload'],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setUploadMode(mode)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  uploadMode === mode
                    ? 'bg-brand-gradient text-ink'
                    : 'border border-white/15 text-slate-300 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {bulkSuccessMessage && (
            <div className="mx-auto mb-6 max-w-3xl rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {bulkSuccessMessage}
            </div>
          )}

          {uploadMode === 'bulk' ? (
            <form onSubmit={handleBulkUpload} className="card mx-auto max-w-3xl space-y-5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-white/20 bg-slate-950/40 hover:border-primary/60 hover:bg-white/5'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-10 w-10 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V6m0 0L7.5 10.5M12 6l4.5 4.5M4.5 18.75A2.25 2.25 0 006.75 21h10.5a2.25 2.25 0 002.25-2.25"
                  />
                </svg>
                {csvFile ? (
                  <div>
                    <p className="text-sm font-semibold text-white">{csvFile.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {(csvFile.size / 1024).toFixed(1)} KB · Click or drop to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-white">Drag &amp; drop your CSV here</p>
                    <p className="mt-1 text-xs text-slate-400">or click to browse</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileInputChange}
              />

              {bulkUploadCsv.isPending && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{uploadProgress < 100 ? 'Uploading...' : 'Processing tickets...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 w-full overflow-hidden rounded-full bg-white/10"
                  >
                    <div
                      className="h-full rounded-full bg-brand-gradient transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {(bulkFileError || bulkUploadCsv.isError) && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  Bulk upload failed
                  {bulkFileError
                    ? `: ${bulkFileError}`
                    : bulkUploadCsv.error instanceof Error
                      ? `: ${bulkUploadCsv.error.message}`
                      : '.'}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCsvFile(null);
                    setBulkFileError(null);
                    setUploadProgress(0);
                  }}
                  disabled={bulkUploadCsv.isPending || !csvFile}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={bulkUploadCsv.isPending || !csvFile}
                  className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bulkUploadCsv.isPending ? 'Uploading tickets...' : 'Upload tickets'}
                </button>
              </div>
            </form>
          ) : (
        <form onSubmit={handleUpload} className="card mx-auto max-w-3xl space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Ticket ID</span>
              <input
                required
                value={form.id}
                onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))}
                placeholder="FE-901"
                className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Implement ticket workflow"
                className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value as TicketCategory }))
                }
                className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Phase</span>
              <select
                value={form.phase}
                onChange={(event) => setForm((current) => ({ ...current, phase: event.target.value }))}
                className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
              >
                {phases.map((item) => (
                  <option key={item.slug} value={item.phase}>
                    Phase {item.phase}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Priority</span>
              <input
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                placeholder="High"
                className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm text-slate-300">
            <span>Tag</span>
            <input
              value={form.tag}
              onChange={(event) => setForm((current) => ({ ...current, tag: event.target.value }))}
              placeholder="[Frontend: DevOps]"
              className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-300">
            <span>Description</span>
            <textarea
              required
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-300">
            <span>Acceptance criteria</span>
            <textarea
              value={form.acceptance}
              onChange={(event) => setForm((current) => ({ ...current, acceptance: event.target.value }))}
              rows={5}
              placeholder="One criterion per line"
              className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-primary"
            />
          </label>

          {createTicket.isError && (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Upload failed
              {createTicket.error instanceof Error ? `: ${createTicket.error.message}` : '.'}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setForm(initialFormState)}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createTicket.isPending ? 'Uploading...' : 'Upload ticket'}
            </button>
          </div>
        </form>
          )}
        </>
      )}
    </div>
  );
}

