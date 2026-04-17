import type { WorkflowStatus } from './documentStorage';

export interface ClientPOItem {
  id: string;
  productId: string;
  product: string;
  hsn: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export interface ClientPO {
  id: string;
  clientPoNumber: string;     // Manual — customer's own PO number
  internalRef: string;        // Auto: CPO/2526/001
  date: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  quotationId: string;
  quotationNumber: string;
  items: ClientPOItem[];
  totalAmount: number;
  notes: string;
  workflowStatus: WorkflowStatus;
  supplierPoIds: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'sjmart_clientpos';

function readAll(): ClientPO[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: ClientPO[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function generateInternalRef(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  const fyCode = `${String(fyStart).slice(2)}${String(fyEnd).slice(2)}`;
  const prefix = `CPO/${fyCode}/`;
  const all = readAll();
  const existing = all
    .filter(c => c.internalRef.startsWith(prefix))
    .map(c => parseInt(c.internalRef.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function getClientPOs(): ClientPO[] {
  return readAll();
}

export function getClientPO(id: string): ClientPO | undefined {
  return readAll().find(c => c.id === id);
}

export function saveClientPO(
  data: Omit<ClientPO, 'id' | 'internalRef' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): ClientPO {
  const all = readAll();
  const now = new Date().toISOString();

  if (existingId) {
    const idx = all.findIndex(c => c.id === existingId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data, updatedAt: now };
      writeAll(all);
      return all[idx];
    }
  }

  const created: ClientPO = {
    ...data,
    id: crypto.randomUUID(),
    internalRef: generateInternalRef(),
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(created);
  writeAll(all);
  return created;
}

export function deleteClientPO(id: string): void {
  writeAll(readAll().filter(c => c.id !== id));
}

export function attachSupplierPoToClientPo(clientPoId: string, supplierPoId: string): void {
  const all = readAll();
  const idx = all.findIndex(c => c.id === clientPoId);
  if (idx !== -1) {
    if (!all[idx].supplierPoIds.includes(supplierPoId)) {
      all[idx].supplierPoIds.push(supplierPoId);
    }
    all[idx].workflowStatus = 'ordered';
    all[idx].updatedAt = new Date().toISOString();
    writeAll(all);
  }
}
