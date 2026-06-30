#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_TS_FILE = path.join(ROOT, 'src', 'data', 'contractErd.ts');
const OUT_JSON_FILE = path.join(ROOT, 'public', 'data', 'contract-erd.json');
const DEFAULT_REPO_URL = 'https://github.com/Potato-Mart/Backend-Shared-Contract.git';
const DEFAULT_REF = 'main';
const REPO_URL = process.env.CONTRACT_REPO_URL || DEFAULT_REPO_URL;
const REPO_REF = process.env.CONTRACT_REF || DEFAULT_REF;
const CACHE_DIR = process.env.CONTRACT_CACHE_DIR || path.join(ROOT, '.cache', 'contract-erd');
const CHECKOUT_DIR = path.join(CACHE_DIR, 'Backend-Shared-Contract');

const PRIMITIVE_TYPES = new Set([
  'bool',
  'byte',
  'error',
  'float32',
  'float64',
  'int',
  'int8',
  'int16',
  'int32',
  'int64',
  'rune',
  'string',
  'uint',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uintptr',
  'any',
  'interface{}',
]);

const WELL_KNOWN_REFS = new Map([
  ['AccountID', 'identity.UserAccount'],
  ['AuthIdentityID', 'identity.AuthIdentity'],
  ['CouponCode', 'promotion.Coupon'],
  ['DefaultOrganisationAccessID', 'wholesale.OrganisationAccess'],
  ['DefaultWholesaleOrganisationCode', 'wholesale.WholesaleOrganisation'],
  ['DepotCode', 'warehouse.Depot'],
  ['GiftCardCode', 'wallet.GiftCard'],
  ['MembershipAccountID', 'membership.MembershipAccount'],
  ['OrganisationAccessID', 'wholesale.OrganisationAccess'],
  ['PaymentID', 'sales.Payment'],
  ['PortalAccessID', 'identity.PortalAccess'],
  ['PrimaryWholesaleCustomerID', 'wholesale.WholesaleCustomer'],
  ['ProductSKUCode', 'product.Product'],
  ['ProductSKUCodes', 'product.Product'],
  ['PurchaseOrderNumber', 'purchase.Order'],
  ['PurchaseReceiptID', 'purchase.Receipt'],
  ['RelatedRewardCode', 'membership.Reward'],
  ['RelatedRewardRedemptionID', 'membership.RewardRedemption'],
  ['RetailCustomerNumber', 'customers.RetailCustomer'],
  ['RewardCode', 'membership.Reward'],
  ['RewardRedemptionID', 'membership.RewardRedemption'],
  ['RoleKey', 'identity.Role'],
  ['SalesOrderNumber', 'sales.Order'],
  ['SourceRewardCode', 'membership.Reward'],
  ['SupplierCode', 'purchase.Supplier'],
  ['TerminalID', 'payments.Terminal'],
  ['UserID', 'identity.UserProfile'],
  ['WholesaleCustomerNumber', 'wholesale.WholesaleCustomer'],
  ['WholesaleOrganisationCode', 'wholesale.WholesaleOrganisation'],
]);

function runGit(args, cwd = ROOT) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureCheckout() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const gitDir = path.join(CHECKOUT_DIR, '.git');
  if (!(await pathExists(gitDir))) {
    await fs.rm(CHECKOUT_DIR, { recursive: true, force: true });
    runGit(['clone', '--filter=blob:none', '--no-tags', REPO_URL, CHECKOUT_DIR], ROOT);
  }

  const currentRemote = runGit(['remote', 'get-url', 'origin'], CHECKOUT_DIR);
  if (currentRemote !== REPO_URL) {
    runGit(['remote', 'set-url', 'origin', REPO_URL], CHECKOUT_DIR);
  }

  runGit(['fetch', '--prune', '--no-tags', 'origin', REPO_REF], CHECKOUT_DIR);
  runGit(['checkout', '--force', 'FETCH_HEAD'], CHECKOUT_DIR);
  return runGit(['rev-parse', 'HEAD'], CHECKOUT_DIR);
}

async function listGoFiles(dir) {
  if (!(await pathExists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listGoFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith('.go') && !entry.name.endsWith('_test.go')) {
        return [fullPath];
      }
      return [];
    }),
  );
  return files.flat();
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function stripLineComment(line) {
  let inTag = false;
  for (let i = 0; i < line.length - 1; i += 1) {
    if (line[i] === '`') {
      inTag = !inTag;
    }
    if (!inTag && line[i] === '/' && line[i + 1] === '/') {
      return line.slice(0, i);
    }
  }
  return line;
}

function splitStructFields(body) {
  const fields = [];
  let current = '';
  let inTag = false;

  for (const char of body) {
    if (char === '`') {
      inTag = !inTag;
    }
    if (!inTag && char === '\n') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    fields.push(current);
  }
  return fields;
}

function parseImports(content) {
  const imports = new Map();
  const addImport = (raw) => {
    const match = raw.match(/^\s*(?:(\w+)\s+)?["']([^"']+)["']/);
    if (!match) {
      return;
    }
    const alias = match[1];
    const importPath = match[2];
    const parts = importPath.split('/');
    const packageName = parts.at(-1);
    const qualifier = alias || packageName;
    if (parts.includes('contracts') || parts.includes('common') || parts.includes('enums')) {
      imports.set(qualifier, packageName);
    }
  };

  const block = content.match(/import\s*\(([\s\S]*?)\)/m);
  if (block) {
    block[1].split('\n').forEach((line) => addImport(stripLineComment(line).trim()));
  }

  const singleImports = content.matchAll(/import\s+(?:(\w+)\s+)?["']([^"']+)["']/g);
  for (const match of singleImports) {
    addImport(`${match[1] ? `${match[1]} ` : ''}"${match[2]}"`);
  }

  return imports;
}

function findStructBodies(content) {
  const structs = [];
  const structPattern = /type\s+([A-Z]\w*)\s+struct\s*\{/g;
  let match;

  while ((match = structPattern.exec(content)) !== null) {
    const name = match[1];
    const bodyStart = structPattern.lastIndex;
    let depth = 1;
    let inTag = false;
    let index = bodyStart;

    for (; index < content.length; index += 1) {
      const char = content[index];
      if (char === '`') {
        inTag = !inTag;
      }
      if (inTag) {
        continue;
      }
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
    }

    if (depth === 0) {
      structs.push({ name, body: content.slice(bodyStart, index) });
      structPattern.lastIndex = index + 1;
    }
  }

  return structs;
}

function unwrapType(typeExpr) {
  let type = typeExpr.trim();
  let optional = false;
  let repeated = false;

  while (type.startsWith('*')) {
    optional = true;
    type = type.slice(1).trim();
  }

  while (type.startsWith('[]')) {
    repeated = true;
    type = type.slice(2).trim();
    while (type.startsWith('*')) {
      optional = true;
      type = type.slice(1).trim();
    }
  }

  const arrayMatch = type.match(/^\[[^\]]+\](.*)$/);
  if (arrayMatch) {
    repeated = true;
    type = arrayMatch[1].trim();
  }

  if (type.startsWith('map[')) {
    repeated = true;
    const lastBracket = type.lastIndexOf(']');
    if (lastBracket !== -1) {
      type = type.slice(lastBracket + 1).trim();
      while (type.startsWith('*')) {
        optional = true;
        type = type.slice(1).trim();
      }
    }
  }

  return { type, optional, repeated };
}

function parseJsonTag(line) {
  const match = line.match(/`[^`]*json:"([^"]+)"[^`]*`/);
  if (!match) {
    return { jsonName: '', omitempty: false, skip: false };
  }

  const parts = match[1].split(',');
  return {
    jsonName: parts[0],
    omitempty: parts.includes('omitempty'),
    skip: parts[0] === '-',
  };
}

function parseField(line, importAliases) {
  const cleanLine = stripLineComment(line).trim();
  if (!cleanLine) {
    return null;
  }

  const tag = parseJsonTag(cleanLine);
  if (tag.skip) {
    return null;
  }

  const beforeTag = cleanLine.split('`')[0].trim();
  if (!beforeTag) {
    return null;
  }

  const parts = beforeTag.split(/\s+/);
  let name;
  let typeExpr;
  let embedded = false;

  if (parts.length === 1) {
    embedded = true;
    typeExpr = parts[0];
    name = typeExpr.replace(/^\*+/, '').split('.').at(-1) || typeExpr;
  } else {
    name = parts[0].replace(/,$/, '');
    typeExpr = parts.slice(1).join(' ');
  }

  if (!/^[A-Z]/.test(name)) {
    return null;
  }

  const { type, optional, repeated } = unwrapType(typeExpr);
  const typeParts = type.split('.');
  const qualifier = typeParts.length > 1 ? typeParts[0] : '';
  const typeName = typeParts.at(-1) || type;
  const importedPackage = qualifier ? importAliases.get(qualifier) : '';

  return {
    name,
    jsonName: tag.jsonName || '',
    type,
    typeName,
    packageName: importedPackage || '',
    kind: 'primitive',
    optional: optional || tag.omitempty,
    repeated,
    embedded,
    targetId: '',
  };
}

function getFilePackage(filePath) {
  const posixPath = toPosix(path.relative(CHECKOUT_DIR, filePath));
  const parts = posixPath.split('/');
  if (parts[0] === 'pkg' && parts[1] === 'common') {
    return { kind: 'common', packageName: 'common', sourcePath: posixPath };
  }
  if (parts[0] === 'pkg' && parts[1] === 'contracts') {
    return { kind: 'contract', packageName: parts[2], sourcePath: posixPath };
  }
  return null;
}

function isSnapshotLike(typeName) {
  return /(Snapshot|Summary|Ref)$/.test(typeName);
}

function isEventLike(typeName, fieldName) {
  return /(Event|History|Audit|Log|Incident|Evidence|Custody)/.test(typeName + fieldName);
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function stripReferenceSuffix(fieldName) {
  return fieldName
    .replace(/IDs$/, '')
    .replace(/ID$/, '')
    .replace(/Codes$/, '')
    .replace(/Code$/, '')
    .replace(/Numbers$/, '')
    .replace(/Number$/, '')
    .replace(/Keys$/, '')
    .replace(/Key$/, '');
}

function classifyField(field, currentPackage, nodeById) {
  const localPackage = field.packageName || currentPackage;
  const candidateId = `${localPackage}.${field.typeName}`;

  if (PRIMITIVE_TYPES.has(field.type) || field.type.startsWith('time.')) {
    return { ...field, kind: field.type.startsWith('time.') ? 'external' : 'primitive' };
  }

  if (nodeById.has(candidateId)) {
    const target = nodeById.get(candidateId);
    return {
      ...field,
      packageName: target.packageName,
      kind: target.kind,
      targetId: target.id,
    };
  }

  if (field.packageName === 'enums' || field.type.startsWith('enums.')) {
    return { ...field, packageName: 'enums', kind: 'enum' };
  }

  return {
    ...field,
    packageName: field.packageName,
    kind: /^[A-Z]/.test(field.typeName) ? 'external' : 'primitive',
  };
}

function findReferenceTarget(field, nodeById, nodes) {
  if (field.kind !== 'primitive' || !/^(string|\[\]string)$/.test(field.type) || field.targetId) {
    return '';
  }

  const direct = WELL_KNOWN_REFS.get(field.name);
  if (direct && nodeById.has(direct)) {
    return direct;
  }

  const stripped = stripReferenceSuffix(field.name);
  if (stripped === field.name || stripped.length < 3) {
    return '';
  }

  const normalized = normalizeName(stripped);
  const candidates = nodes.filter((node) => normalizeName(node.name) === normalized);
  return candidates.length === 1 ? candidates[0].id : '';
}

function getTypedEdgeKind(field, targetNode) {
  if (field.embedded) {
    return 'embeds';
  }
  if (isSnapshotLike(field.typeName) || isSnapshotLike(targetNode.name)) {
    return 'snapshot';
  }
  if (isEventLike(field.typeName, field.name)) {
    return 'event';
  }
  if (targetNode.id === 'common.PartyRef') {
    return 'polymorphic';
  }
  return 'contains';
}

function cardinalityFor(field) {
  if (field.repeated) {
    return '0..*';
  }
  if (field.optional) {
    return '0..1';
  }
  return '1';
}

function edgeId(source, target, fieldName, kind) {
  return `${source}--${fieldName}--${kind}--${target}`;
}

function buildEdges(nodes, nodeById) {
  const edges = new Map();
  const addEdge = (edge) => {
    if (edge.source !== edge.target && !edges.has(edge.id)) {
      edges.set(edge.id, edge);
    }
  };

  for (const node of nodes) {
    for (const field of node.fields) {
      if (field.targetId && nodeById.has(field.targetId)) {
        const target = nodeById.get(field.targetId);
        const kind = getTypedEdgeKind(field, target);
        addEdge({
          id: edgeId(node.id, target.id, field.name, kind),
          source: node.id,
          target: target.id,
          sourceField: field.name,
          label: field.jsonName || field.name,
          kind,
          cardinality: cardinalityFor(field),
        });
        continue;
      }

      const refTarget = findReferenceTarget(field, nodeById, nodes);
      if (refTarget) {
        field.targetId = refTarget;
        addEdge({
          id: edgeId(node.id, refTarget, field.name, 'references'),
          source: node.id,
          target: refTarget,
          sourceField: field.name,
          label: field.jsonName || field.name,
          kind: 'references',
          cardinality: cardinalityFor(field),
        });
      }
    }

    const fieldNames = new Set(node.fields.map((field) => field.name));
    const polymorphicPairs = [
      ['OwnerType', 'OwnerID'],
      ['ReferenceType', 'ReferenceID'],
      ['Resource', 'ResourceID'],
      ['ResourceType', 'ResourceID'],
      ['ScopeType', 'ScopeID'],
      ['ActorType', 'ActorID'],
    ];
    for (const [typeField, idField] of polymorphicPairs) {
      if (fieldNames.has(typeField) && fieldNames.has(idField) && nodeById.has('common.PartyRef')) {
        addEdge({
          id: edgeId(node.id, 'common.PartyRef', `${typeField}_${idField}`, 'polymorphic'),
          source: node.id,
          target: 'common.PartyRef',
          sourceField: `${typeField}/${idField}`,
          label: `${typeField}/${idField}`,
          kind: 'polymorphic',
          cardinality: '0..1',
        });
      }
    }
  }

  return [...edges.values()].sort((a, b) => a.id.localeCompare(b.id));
}

async function parseContracts() {
  const files = [
    ...(await listGoFiles(path.join(CHECKOUT_DIR, 'pkg', 'contracts'))),
    ...(await listGoFiles(path.join(CHECKOUT_DIR, 'pkg', 'common'))),
  ];

  const nodes = [];
  const rawNodes = [];

  for (const file of files) {
    const packageInfo = getFilePackage(file);
    if (!packageInfo) {
      continue;
    }

    const content = await fs.readFile(file, 'utf8');
    const importAliases = parseImports(content);
    const structs = findStructBodies(content);

    for (const struct of structs) {
      const fields = splitStructFields(struct.body)
        .map((line) => parseField(line, importAliases))
        .filter(Boolean);

      rawNodes.push({
        id: `${packageInfo.packageName}.${struct.name}`,
        packageName: packageInfo.packageName,
        name: struct.name,
        fullName:
          packageInfo.kind === 'common'
            ? `common.${struct.name}`
            : `contracts/${packageInfo.packageName}.${struct.name}`,
        sourcePath: packageInfo.sourcePath,
        kind: packageInfo.kind,
        fields,
      });
    }
  }

  const nodeById = new Map(rawNodes.map((node) => [node.id, node]));
  for (const node of rawNodes) {
    nodes.push({
      ...node,
      fields: node.fields.map((field) => classifyField(field, node.packageName, nodeById)),
    });
  }

  const classifiedById = new Map(nodes.map((node) => [node.id, node]));
  const edges = buildEdges(nodes, classifiedById);
  const packages = [...new Set(nodes.map((node) => node.packageName))].sort((a, b) =>
    a.localeCompare(b),
  );

  return {
    packages,
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges,
  };
}

function buildPackageCounts(nodes) {
  return nodes.reduce((counts, node) => {
    counts[node.packageName] = (counts[node.packageName] || 0) + 1;
    return counts;
  }, {});
}

function renderTypeScript(summary) {
  return `// AUTO-GENERATED by scripts/generate-contract-erd.mjs from Backend-Shared-Contract. Do not edit by hand.
export const CONTRACT_ERD_DATA_URL = '/data/contract-erd.json';

export type ContractNodeKind = 'contract' | 'common';
export type ContractFieldKind = 'primitive' | 'enum' | 'contract' | 'common' | 'external';
export type ContractEdgeKind =
  | 'contains'
  | 'embeds'
  | 'references'
  | 'snapshot'
  | 'event'
  | 'polymorphic';

export interface ContractField {
  name: string;
  jsonName: string;
  type: string;
  typeName: string;
  packageName: string;
  kind: ContractFieldKind;
  optional: boolean;
  repeated: boolean;
  embedded: boolean;
  targetId: string;
}

export interface ContractNode {
  id: string;
  packageName: string;
  name: string;
  fullName: string;
  sourcePath: string;
  kind: ContractNodeKind;
  fields: ContractField[];
}

export interface ContractEdge {
  id: string;
  source: string;
  target: string;
  sourceField: string;
  label: string;
  kind: ContractEdgeKind;
  cardinality: string;
}

export interface ContractErdMetadata {
  repoUrl: string;
  ref: string;
  commit: string;
  modulePath: string;
  generatedAt: string;
  nodeCount: number;
  edgeCount: number;
}

export interface ContractErdData {
  metadata: ContractErdMetadata;
  packages: string[];
  nodes: ContractNode[];
  edges: ContractEdge[];
}

export interface ContractErdSummary {
  metadata: ContractErdMetadata;
  packages: string[];
  packageCounts: Record<string, number>;
}

export const contractErdSummary: ContractErdSummary = ${JSON.stringify(summary, null, 2)};
`;
}

async function main() {
  const commit = await ensureCheckout();
  const goMod = await fs.readFile(path.join(CHECKOUT_DIR, 'go.mod'), 'utf8');
  const modulePath = goMod.match(/^module\s+(.+)$/m)?.[1] || '';
  const parsed = await parseContracts();
  const data = {
    metadata: {
      repoUrl: REPO_URL,
      ref: REPO_REF,
      commit,
      modulePath,
      generatedAt: new Date().toISOString(),
      nodeCount: parsed.nodes.length,
      edgeCount: parsed.edges.length,
    },
    ...parsed,
  };
  const summary = {
    metadata: data.metadata,
    packages: data.packages,
    packageCounts: buildPackageCounts(data.nodes),
  };

  await fs.mkdir(path.dirname(OUT_TS_FILE), { recursive: true });
  await fs.mkdir(path.dirname(OUT_JSON_FILE), { recursive: true });
  await fs.writeFile(OUT_TS_FILE, renderTypeScript(summary), 'utf8');
  await fs.writeFile(OUT_JSON_FILE, `${JSON.stringify(data)}\n`, 'utf8');

  console.log(
    `Generated ${path.relative(ROOT, OUT_JSON_FILE)} and ${path.relative(ROOT, OUT_TS_FILE)} ` +
      `from ${REPO_URL}#${commit}: ` +
      `${data.metadata.nodeCount} nodes, ${data.metadata.edgeCount} edges.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
