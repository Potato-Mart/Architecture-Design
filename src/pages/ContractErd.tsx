import { ContractErdGraph } from '../components/ContractErdGraph';
import { PageHeader } from '../components/PageHeader';
import { contractErdData } from '../data/contractErd';

export function ContractErdPage() {
  const commit = contractErdData.metadata.commit.slice(0, 7);

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="合約關係 ERD (Contract Relationships)"
        subtitle={`Generated from Backend-Shared-Contract ${contractErdData.metadata.ref}@${commit}. Drag nodes, pan the canvas, and zoom to inspect ${contractErdData.metadata.nodeCount} contract structs and ${contractErdData.metadata.edgeCount} relationships.`}
        badge={{ label: 'Backend Shared Contract', className: 'badge-accent' }}
      />
      <ContractErdGraph />
    </div>
  );
}
