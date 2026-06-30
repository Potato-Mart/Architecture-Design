import { memo, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  contractErdData,
  type ContractEdge,
  type ContractEdgeKind,
  type ContractField,
  type ContractNode,
} from '../data/contractErd';

interface ContractNodeData extends Record<string, unknown> {
  contractNode: ContractNode;
  relationshipCount: number;
}

type ContractFlowNode = Node<ContractNodeData, 'contractNode'>;
type ContractFlowEdge = Edge<{ contractEdge: ContractEdge }>;

const edgeKindConfig: Record<
  ContractEdgeKind,
  { label: string; color: string; description: string; dashed?: boolean }
> = {
  contains: {
    label: 'Contains',
    color: '#60a5fa',
    description: 'Typed nested contract struct',
  },
  embeds: {
    label: 'Embeds',
    color: '#34d399',
    description: 'Anonymous flattened struct/mixin',
  },
  references: {
    label: 'References',
    color: '#fbbf24',
    description: 'ID, code, number, or key reference',
  },
  snapshot: {
    label: 'Snapshot',
    color: '#c4b5fd',
    description: 'Copied projection or summary',
    dashed: true,
  },
  event: {
    label: 'Event',
    color: '#f87171',
    description: 'History, audit, event, or incident link',
    dashed: true,
  },
  polymorphic: {
    label: 'Polymorphic',
    color: '#fb7185',
    description: 'Target depends on discriminator fields',
    dashed: true,
  },
};

const packagePalette = [
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#c4b5fd',
  '#22d3ee',
  '#fb7185',
  '#a3e635',
  '#f97316',
  '#818cf8',
];

function packageColor(packageName: string) {
  const index = contractErdData.packages.indexOf(packageName);
  return packagePalette[Math.max(index, 0) % packagePalette.length];
}

function sortById<T extends { id: string }>(items: T[]) {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

function fieldMatches(field: ContractField, query: string) {
  const haystack = `${field.name} ${field.jsonName} ${field.type} ${field.packageName}`.toLowerCase();
  return haystack.includes(query);
}

function nodeMatches(node: ContractNode, query: string) {
  const haystack = `${node.id} ${node.name} ${node.fullName} ${node.packageName}`.toLowerCase();
  return haystack.includes(query) || node.fields.some((field) => fieldMatches(field, query));
}

function getVisibleNodeIds(
  selectedPackages: Set<string>,
  edgeKinds: Set<ContractEdgeKind>,
  searchQuery: string,
  showCommon: boolean,
) {
  const query = searchQuery.trim().toLowerCase();
  const baseIds = new Set(
    contractErdData.nodes
      .filter((node) => selectedPackages.has(node.packageName))
      .filter((node) => showCommon || node.kind !== 'common')
      .map((node) => node.id),
  );

  if (!query) {
    return baseIds;
  }

  const matchedIds = new Set(
    contractErdData.nodes.filter((node) => nodeMatches(node, query)).map((node) => node.id),
  );
  const expandedIds = new Set(matchedIds);
  for (const edge of contractErdData.edges) {
    if (!edgeKinds.has(edge.kind)) {
      continue;
    }
    if (matchedIds.has(edge.source) || matchedIds.has(edge.target)) {
      expandedIds.add(edge.source);
      expandedIds.add(edge.target);
    }
  }

  return new Set([...baseIds].filter((id) => expandedIds.has(id)));
}

function getLayoutedNodes(nodes: ContractNode[], relationshipCounts: Map<string, number>) {
  const visiblePackages = [...new Set(nodes.map((node) => node.packageName))].sort((a, b) =>
    a.localeCompare(b),
  );
  const packageIndex = new Map(visiblePackages.map((packageName, index) => [packageName, index]));
  const packageColumns = 3;
  const packageWidth = 860;
  const packageHeight = 940;
  const nodeWidth = 245;
  const nodeHeight = 150;
  const nodesPerRow = 3;

  const packageNodeIndex = new Map<string, number>();

  return sortById(nodes).map<ContractFlowNode>((node) => {
    const packageSlot = packageIndex.get(node.packageName) ?? 0;
    const packageX = (packageSlot % packageColumns) * packageWidth;
    const packageY = Math.floor(packageSlot / packageColumns) * packageHeight;
    const nodeIndex = packageNodeIndex.get(node.packageName) ?? 0;
    packageNodeIndex.set(node.packageName, nodeIndex + 1);

    return {
      id: node.id,
      type: 'contractNode',
      position: {
        x: packageX + (nodeIndex % nodesPerRow) * nodeWidth,
        y: packageY + Math.floor(nodeIndex / nodesPerRow) * nodeHeight,
      },
      data: {
        contractNode: node,
        relationshipCount: relationshipCounts.get(node.id) ?? 0,
      },
    };
  });
}

function getFlowEdges(edges: ContractEdge[]) {
  return edges.map<ContractFlowEdge>((edge) => {
    const config = edgeKindConfig[edge.kind];
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.cardinality === '1' ? edge.label : `${edge.label} ${edge.cardinality}`,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: config.color,
      },
      style: {
        stroke: config.color,
        strokeWidth: 1.8,
        strokeDasharray: config.dashed ? '7 5' : undefined,
      },
      labelStyle: {
        fill: '#cbd5e1',
        fontSize: 11,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: 'rgba(15, 23, 42, 0.92)',
      },
      labelBgPadding: [6, 3],
      data: { contractEdge: edge },
    };
  });
}

function ContractNodeCard({ data, selected }: NodeProps<ContractFlowNode>) {
  const { contractNode, relationshipCount } = data;
  const color = packageColor(contractNode.packageName);
  const visibleFields = contractNode.fields.slice(0, 4);
  const hiddenFieldCount = contractNode.fields.length - visibleFields.length;

  return (
    <div
      className={`w-[220px] rounded-lg border bg-slate-950/95 p-3 shadow-xl backdrop-blur transition ${
        selected ? 'border-primary ring-2 ring-primary/60' : 'border-white/15'
      }`}
      style={{ boxShadow: `0 0 0 1px ${color}33, 0 18px 40px -28px ${color}` }}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-slate-300" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-slate-300" />
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
        <span
          className="truncate rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950"
          style={{ backgroundColor: color }}
        >
          {contractNode.packageName}
        </span>
        <span className="shrink-0 text-[10px] text-slate-400">{relationshipCount} rel</span>
      </div>
      <div className="truncate text-sm font-bold text-white">{contractNode.name}</div>
      <div className="mt-0.5 truncate text-[11px] text-slate-500">{contractNode.sourcePath}</div>
      <div className="mt-3 space-y-1">
        {visibleFields.map((field) => (
          <div key={`${contractNode.id}-${field.name}`} className="flex min-w-0 gap-1 text-[11px]">
            <span className="truncate text-slate-300">{field.jsonName || field.name}</span>
            <span className="shrink-0 text-slate-500">:</span>
            <span className="truncate text-slate-500">{field.type}</span>
          </div>
        ))}
        {hiddenFieldCount > 0 && (
          <div className="text-[11px] font-medium text-slate-500">+{hiddenFieldCount} fields</div>
        )}
      </div>
    </div>
  );
}

const MemoizedContractNodeCard = memo(ContractNodeCard);

const nodeTypes = {
  contractNode: MemoizedContractNodeCard,
};

function RelationshipList({
  title,
  relationships,
  nodeById,
}: {
  title: string;
  relationships: ContractEdge[];
  nodeById: Map<string, ContractNode>;
}) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{title}</h4>
      {relationships.length === 0 ? (
        <p className="text-sm text-slate-500">None</p>
      ) : (
        <div className="space-y-2">
          {relationships.slice(0, 14).map((edge) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            return (
              <div key={edge.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="rounded-full px-2 py-0.5 font-semibold text-slate-950"
                    style={{ backgroundColor: edgeKindConfig[edge.kind].color }}
                  >
                    {edgeKindConfig[edge.kind].label}
                  </span>
                  <span className="font-medium text-slate-200">{edge.sourceField}</span>
                  <span className="text-slate-500">{edge.cardinality}</span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {source?.name ?? edge.source} {'->'} {target?.name ?? edge.target}
                </p>
              </div>
            );
          })}
          {relationships.length > 14 && (
            <p className="text-xs text-slate-500">+{relationships.length - 14} more relationships</p>
          )}
        </div>
      )}
    </section>
  );
}

function FieldList({
  fields,
  nodeById,
}: {
  fields: ContractField[];
  nodeById: Map<string, ContractNode>;
}) {
  return (
    <div className="max-h-[300px] overflow-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[420px] text-left text-xs">
        <thead className="sticky top-0 bg-slate-950 text-slate-300">
          <tr>
            <th className="px-3 py-2 font-semibold">Field</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Kind</th>
            <th className="px-3 py-2 font-semibold">Target</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {fields.map((field) => (
            <tr key={`${field.name}-${field.type}`}>
              <td className="px-3 py-2 text-slate-200">
                <div className="font-medium">{field.jsonName || field.name}</div>
                <div className="text-[11px] text-slate-500">{field.name}</div>
              </td>
              <td className="px-3 py-2 text-slate-400">{field.type}</td>
              <td className="px-3 py-2 text-slate-400">
                {field.embedded ? 'embedded ' : ''}
                {field.repeated ? '[] ' : ''}
                {field.optional ? 'optional ' : ''}
                {field.kind}
              </td>
              <td className="px-3 py-2 text-slate-400">
                {field.targetId ? nodeById.get(field.targetId)?.name ?? field.targetId : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GraphToolbar({
  visibleNodeCount,
  visibleEdgeCount,
  totalNodeCount,
  totalEdgeCount,
}: {
  visibleNodeCount: number;
  visibleEdgeCount: number;
  totalNodeCount: number;
  totalEdgeCount: number;
}) {
  const { fitView, setViewport } = useReactFlow<ContractFlowNode, ContractFlowEdge>();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-slate-950/90 p-2 text-xs shadow-xl backdrop-blur">
      <button
        type="button"
        className="rounded-md bg-primary px-3 py-1.5 font-semibold text-ink transition hover:bg-primary-hover"
        onClick={() => fitView({ padding: 0.18, duration: 300 })}
      >
        Fit
      </button>
      <button
        type="button"
        className="rounded-md border border-white/15 px-3 py-1.5 font-semibold text-slate-200 transition hover:bg-white/10"
        onClick={() => setViewport({ x: 40, y: 40, zoom: 0.55 }, { duration: 300 })}
      >
        Reset
      </button>
      <span className="px-2 text-slate-400">
        {visibleNodeCount}/{totalNodeCount} nodes · {visibleEdgeCount}/{totalEdgeCount} edges
      </span>
    </div>
  );
}

function ContractErdGraphInner() {
  const nonCommonPackages = useMemo(
    () => contractErdData.packages.filter((packageName) => packageName !== 'common'),
    [],
  );
  const [selectedPackages, setSelectedPackages] = useState(() => new Set(nonCommonPackages));
  const [selectedEdgeKinds, setSelectedEdgeKinds] = useState(
    () => new Set(Object.keys(edgeKindConfig) as ContractEdgeKind[]),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommon, setShowCommon] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState('sales.Order');
  const stableNodeTypes = useMemo(() => nodeTypes, []);

  const nodeById = useMemo(
    () => new Map(contractErdData.nodes.map((node) => [node.id, node])),
    [],
  );

  const visibleNodeIds = useMemo(
    () => getVisibleNodeIds(selectedPackages, selectedEdgeKinds, searchQuery, showCommon),
    [searchQuery, selectedEdgeKinds, selectedPackages, showCommon],
  );

  const visibleEdges = useMemo(
    () =>
      contractErdData.edges.filter(
        (edge) =>
          selectedEdgeKinds.has(edge.kind) &&
          visibleNodeIds.has(edge.source) &&
          visibleNodeIds.has(edge.target),
      ),
    [selectedEdgeKinds, visibleNodeIds],
  );

  const relationshipCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const edge of contractErdData.edges) {
      counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
      counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
    }
    return counts;
  }, []);

  const flowNodes = useMemo(
    () =>
      getLayoutedNodes(
        contractErdData.nodes.filter((node) => visibleNodeIds.has(node.id)),
        relationshipCounts,
      ),
    [relationshipCounts, visibleNodeIds],
  );
  const flowEdges = useMemo(() => getFlowEdges(visibleEdges), [visibleEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<ContractFlowNode>(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ContractFlowEdge>(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  useEffect(() => {
    if (!visibleNodeIds.has(selectedNodeId)) {
      const nextNode = flowNodes[0]?.id;
      if (nextNode) {
        setSelectedNodeId(nextNode);
      }
    }
  }, [flowNodes, selectedNodeId, visibleNodeIds]);

  const selectedNode = nodeById.get(selectedNodeId) ?? nodeById.get(flowNodes[0]?.id ?? '');
  const incomingRelationships = selectedNode
    ? contractErdData.edges.filter((edge) => edge.target === selectedNode.id)
    : [];
  const outgoingRelationships = selectedNode
    ? contractErdData.edges.filter((edge) => edge.source === selectedNode.id)
    : [];

  const togglePackage = (packageName: string) => {
    setSelectedPackages((current) => {
      const next = new Set(current);
      if (next.has(packageName)) {
        next.delete(packageName);
      } else {
        next.add(packageName);
      }
      return next;
    });
  };

  const toggleEdgeKind = (kind: ContractEdgeKind) => {
    setSelectedEdgeKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) {
        next.delete(kind);
      } else {
        next.add(kind);
      }
      return next;
    });
  };

  const selectAllPackages = () => {
    setSelectedPackages(new Set(showCommon ? contractErdData.packages : nonCommonPackages));
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_420px]">
      <div className="min-w-0 space-y-4">
        <section className="rounded-2xl border border-white/20 bg-slate-900/70 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(280px,2fr)]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Search</span>
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary"
                  placeholder="Order, membership_account_id, Product..."
                />
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Clear
                </button>
              </div>
            </label>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-200">Packages</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-white/15 px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                    onClick={selectAllPackages}
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-white/15 px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                    onClick={() => setSelectedPackages(new Set())}
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-auto pr-1">
                {contractErdData.packages.map((packageName) => {
                  const disabled = packageName === 'common' && !showCommon;
                  return (
                    <label
                      key={packageName}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                        selectedPackages.has(packageName) && !disabled
                          ? 'border-white/25 bg-white/10 text-white'
                          : 'border-white/10 text-slate-500'
                      } ${disabled ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-primary"
                        checked={selectedPackages.has(packageName) && !disabled}
                        disabled={disabled}
                        onChange={() => togglePackage(packageName)}
                      />
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: packageColor(packageName) }}
                      />
                      {packageName}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={showCommon}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setShowCommon(checked);
                  setSelectedPackages((current) => {
                    const next = new Set(current);
                    if (checked) {
                      next.add('common');
                    } else {
                      next.delete('common');
                    }
                    return next;
                  });
                }}
              />
              Show common/value nodes
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(edgeKindConfig) as ContractEdgeKind[]).map((kind) => (
                <label
                  key={kind}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300"
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-primary"
                    checked={selectedEdgeKinds.has(kind)}
                    onChange={() => toggleEdgeKind(kind)}
                  />
                  <span
                    className="h-2 w-5 rounded-full"
                    style={{
                      backgroundColor: edgeKindConfig[kind].color,
                      opacity: selectedEdgeKinds.has(kind) ? 1 : 0.35,
                    }}
                  />
                  {edgeKindConfig[kind].label}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="relative h-[720px] overflow-hidden rounded-2xl border border-white/25 bg-slate-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={stableNodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId('')}
            minZoom={0.1}
            maxZoom={2}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
          >
            <Background color="rgba(148, 163, 184, 0.25)" gap={24} />
            <Controls className="!border-white/10 !bg-slate-950/90 !shadow-xl" />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) =>
                packageColor((node.data as ContractNodeData).contractNode.packageName)
              }
              className="!border !border-white/10 !bg-slate-950/90"
            />
            <Panel position="top-left">
              <GraphToolbar
                visibleNodeCount={nodes.length}
                visibleEdgeCount={edges.length}
                totalNodeCount={contractErdData.metadata.nodeCount}
                totalEdgeCount={contractErdData.metadata.edgeCount}
              />
            </Panel>
          </ReactFlow>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(edgeKindConfig) as ContractEdgeKind[]).map((kind) => (
            <div key={kind} className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="h-2 w-8 rounded-full"
                  style={{ backgroundColor: edgeKindConfig[kind].color }}
                />
                <span className="text-sm font-semibold text-white">{edgeKindConfig[kind].label}</span>
              </div>
              <p className="text-xs text-slate-400">{edgeKindConfig[kind].description}</p>
            </div>
          ))}
        </section>
      </div>

      <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-2xl border border-white/20 bg-slate-900/85 p-5 shadow-xl backdrop-blur">
          {selectedNode ? (
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold uppercase text-slate-950"
                    style={{ backgroundColor: packageColor(selectedNode.packageName) }}
                  >
                    {selectedNode.packageName}
                  </span>
                  <span className="badge badge-primary">{selectedNode.kind}</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{selectedNode.name}</h3>
                <p className="mt-1 break-all text-sm text-slate-400">{selectedNode.fullName}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{selectedNode.sourcePath}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xl font-bold text-white">{selectedNode.fields.length}</div>
                  <div className="text-xs text-slate-500">Fields</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xl font-bold text-white">{outgoingRelationships.length}</div>
                  <div className="text-xs text-slate-500">Outgoing</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xl font-bold text-white">{incomingRelationships.length}</div>
                  <div className="text-xs text-slate-500">Incoming</div>
                </div>
              </div>

              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  Fields
                </h4>
                <FieldList fields={selectedNode.fields} nodeById={nodeById} />
              </section>

              <RelationshipList
                title="Outgoing relationships"
                relationships={outgoingRelationships}
                nodeById={nodeById}
              />
              <RelationshipList
                title="Incoming relationships"
                relationships={incomingRelationships}
                nodeById={nodeById}
              />
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-center text-slate-500">
              Select a contract node for fields and relationships.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export function ContractErdGraph() {
  return (
    <ReactFlowProvider>
      <ContractErdGraphInner />
    </ReactFlowProvider>
  );
}
