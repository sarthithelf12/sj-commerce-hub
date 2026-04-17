export type WorkflowStage =
  | 'enquiry'
  | 'quotation'
  | 'client-po'
  | 'supplier-po'
  | 'delivery-challan'
  | 'tax-invoice'
  | 'payment';

export interface WorkflowLink {
  id: string;
  stage: WorkflowStage;
  documentId: string;
  documentNumber: string;
  parentStage?: WorkflowStage;
  parentId?: string;
  parentNumber?: string;
  customerId?: string;
  customerName?: string;
  createdAt: string;
}

const STORAGE_KEY = 'sjmart_workflow_links';

function readAll(): WorkflowLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(links: WorkflowLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function getAllLinks(): WorkflowLink[] {
  return readAll();
}

export function getLinksForDocument(documentId: string): WorkflowLink[] {
  return readAll().filter(l => l.documentId === documentId || l.parentId === documentId);
}

export function getLinkByDocumentId(documentId: string): WorkflowLink | undefined {
  return readAll().find(l => l.documentId === documentId);
}

/**
 * Build a full ancestry + descendants chain for a document.
 * Returns links ordered from earliest stage to latest.
 */
export function getChainForDocument(documentId: string): WorkflowLink[] {
  const all = readAll();
  const byDocId = new Map(all.map(l => [l.documentId, l]));
  const childrenByParent = new Map<string, WorkflowLink[]>();
  for (const l of all) {
    if (l.parentId) {
      const arr = childrenByParent.get(l.parentId) || [];
      arr.push(l);
      childrenByParent.set(l.parentId, arr);
    }
  }

  // Walk up to root
  let current = byDocId.get(documentId);
  if (!current) return [];
  const ancestors: WorkflowLink[] = [];
  let walker: WorkflowLink | undefined = current;
  while (walker?.parentId) {
    const parent = byDocId.get(walker.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    walker = parent;
  }

  // Walk down (depth-first, single chain — pick first child each time)
  const descendants: WorkflowLink[] = [];
  let down: WorkflowLink | undefined = current;
  while (down) {
    const kids = childrenByParent.get(down.documentId);
    if (!kids || kids.length === 0) break;
    const next = kids[0];
    descendants.push(next);
    down = next;
  }

  return [...ancestors, current, ...descendants];
}

export function saveLink(link: Omit<WorkflowLink, 'id' | 'createdAt'>): WorkflowLink {
  const all = readAll();
  // Avoid exact duplicates (same document + same parent)
  const existing = all.find(
    l => l.documentId === link.documentId && l.parentId === link.parentId
  );
  if (existing) {
    Object.assign(existing, link);
    writeAll(all);
    return existing;
  }
  const newLink: WorkflowLink = {
    ...link,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(newLink);
  writeAll(all);
  return newLink;
}

export function deleteLinksByDocumentId(documentId: string): void {
  writeAll(readAll().filter(l => l.documentId !== documentId && l.parentId !== documentId));
}
