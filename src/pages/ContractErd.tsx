import { useEffect, useState } from 'react';
import { ContractErdGraph } from '../components/ContractErdGraph';
import { PageHeader } from '../components/PageHeader';
import {
  CONTRACT_ERD_DATA_URL,
  contractErdSummary,
  type ContractErdData,
} from '../data/contractErd';

type ContractErdLoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: ContractErdData }
  | { status: 'error'; message: string };

function isContractErdData(value: unknown): value is ContractErdData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ContractErdData>;
  return (
    Boolean(candidate.metadata) &&
    Array.isArray(candidate.packages) &&
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges)
  );
}

export function ContractErdPage() {
  const [loadKey, setLoadKey] = useState(0);
  const [loadState, setLoadState] = useState<ContractErdLoadState>({ status: 'loading' });
  const metadata =
    loadState.status === 'ready' ? loadState.data.metadata : contractErdSummary.metadata;
  const commit = metadata.commit.slice(0, 7);

  useEffect(() => {
    const controller = new AbortController();

    async function loadContractErdData() {
      setLoadState({ status: 'loading' });
      try {
        const response = await fetch(CONTRACT_ERD_DATA_URL, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!isContractErdData(data)) {
          throw new Error('The contract ERD data file has an unexpected shape.');
        }

        setLoadState({ status: 'ready', data });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setLoadState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to load contract ERD data.',
        });
      }
    }

    void loadContractErdData();

    return () => controller.abort();
  }, [loadKey]);

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="合約關係 ERD (Contract Relationships)"
        subtitle={`Generated from Backend-Shared-Contract ${metadata.ref}@${commit}. Drag nodes, pan the canvas, and zoom to inspect ${metadata.nodeCount} contract structs and ${metadata.edgeCount} relationships.`}
        badge={{ label: 'Backend Shared Contract', className: 'badge-accent' }}
      />
      {loadState.status === 'loading' && (
        <div className="rounded-2xl border border-white/20 bg-slate-900/70 p-8 text-slate-300">
          <div className="mb-3 h-2 w-48 animate-pulse rounded-full bg-primary/40" />
          <h2 className="text-xl font-semibold text-white">Loading contract ERD data</h2>
          <p className="mt-2 text-sm text-slate-400">
            Fetching the local static ERD JSON asset from {CONTRACT_ERD_DATA_URL}.
          </p>
        </div>
      )}
      {loadState.status === 'error' && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-red-100">
          <h2 className="text-xl font-semibold">Contract ERD data could not be loaded</h2>
          <p className="mt-2 text-sm text-red-200">{loadState.message}</p>
          <button
            type="button"
            className="mt-5 rounded-lg border border-red-200/40 px-4 py-2 text-sm font-semibold text-red-50 transition hover:bg-red-200/10"
            onClick={() => setLoadKey((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      )}
      {loadState.status === 'ready' && <ContractErdGraph data={loadState.data} />}
    </div>
  );
}
