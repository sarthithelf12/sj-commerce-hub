export type DocumentType = 'quotation' | 'tax-invoice' | 'proforma-invoice' | 'delivery-challan' | 'purchase-order';

export type WorkflowStatus =
  | 'open'
  | 'converted'
  | 'sent'
  | 'po-received'
  | 'ordered'
  | 'delivered'
  | 'partial'
  | 'invoiced'
  | 'raised'
  | 'paid'
  | 'cancelled';

export interface StoredDocument {
  id: string;
  type: DocumentType;
  docNumber: string;
  date: string;
  partyName: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

  // Workflow linkage (optional, backward compatible)
  enquiryId?: string;
  quotationId?: string;
  clientPoRef?: string;
  clientPoId?: string;
  supplierPoId?: string;
  deliveryId?: string;
  invoiceId?: string;
  workflowStatus?: WorkflowStatus;
}

const STORAGE_KEY = 'erp_documents';

function getAllDocuments(): StoredDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAllDocuments(docs: StoredDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function saveDocument(
  type: DocumentType,
  docNumber: string,
  date: string,
  partyName: string,
  amount: number,
  data: Record<string, unknown>,
  existingId?: string,
  extra?: Partial<Pick<StoredDocument,
    'enquiryId' | 'quotationId' | 'clientPoRef' | 'clientPoId' |
    'supplierPoId' | 'deliveryId' | 'invoiceId' | 'workflowStatus'
  >>
): StoredDocument {
  const docs = getAllDocuments();
  const now = new Date().toISOString();

  if (existingId) {
    const index = docs.findIndex(d => d.id === existingId);
    if (index !== -1) {
      docs[index] = {
        ...docs[index],
        docNumber,
        date,
        partyName,
        amount,
        data,
        updatedAt: now,
        ...(extra || {}),
      };
      setAllDocuments(docs);
      return docs[index];
    }
  }

  const doc: StoredDocument = {
    id: crypto.randomUUID(),
    type,
    docNumber,
    date,
    partyName,
    amount,
    status: 'draft',
    data,
    createdAt: now,
    updatedAt: now,
    ...(extra || {}),
  };
  docs.unshift(doc);
  setAllDocuments(docs);
  return doc;
}

export function updateDocumentWorkflowStatus(id: string, workflowStatus: WorkflowStatus): void {
  const docs = getAllDocuments();
  const idx = docs.findIndex(d => d.id === id);
  if (idx !== -1) {
    docs[idx].workflowStatus = workflowStatus;
    docs[idx].updatedAt = new Date().toISOString();
    setAllDocuments(docs);
  }
}

export function getDocuments(type: DocumentType): StoredDocument[] {
  return getAllDocuments().filter(d => d.type === type);
}

export function getDocument(id: string): StoredDocument | undefined {
  return getAllDocuments().find(d => d.id === id);
}

export function deleteDocument(id: string): void {
  const docs = getAllDocuments().filter(d => d.id !== id);
  setAllDocuments(docs);
}

export function updateDocumentStatus(id: string, status: StoredDocument['status']): void {
  const docs = getAllDocuments();
  const index = docs.findIndex(d => d.id === id);
  if (index !== -1) {
    docs[index].status = status;
    docs[index].updatedAt = new Date().toISOString();
    setAllDocuments(docs);
  }
}
