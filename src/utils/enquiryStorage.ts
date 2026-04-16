export type EnquiryStatus = 'open' | 'quoted' | 'won' | 'lost' | 'cancelled';

export interface EnquiryItem {
  id: string;
  productId: string;
  product: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface Enquiry {
  id: string;
  enquiryNo: string;
  date: string;
  customerId: string;
  customerName: string;
  items: EnquiryItem[];
  notes: string;
  status: EnquiryStatus;
  closureReason: string;
  linkedQuotationId: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'sjmart_enquiries';

function getAll(): Enquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll(enquiries: Enquiry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
}

function generateEnquiryNo(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  const fyCode = `${String(fyStart).slice(2)}${String(fyEnd).slice(2)}`;

  const all = getAll();
  const prefix = `ENQ/${fyCode}/`;
  const existing = all
    .filter(e => e.enquiryNo.startsWith(prefix))
    .map(e => parseInt(e.enquiryNo.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));

  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function getEnquiries(status?: EnquiryStatus): Enquiry[] {
  const all = getAll();
  if (!status) return all;
  return all.filter(e => e.status === status);
}

export function getEnquiry(id: string): Enquiry | undefined {
  return getAll().find(e => e.id === id);
}

export function saveEnquiry(
  data: Omit<Enquiry, 'id' | 'enquiryNo' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Enquiry {
  const enquiries = getAll();
  const now = new Date().toISOString();

  if (existingId) {
    const index = enquiries.findIndex(e => e.id === existingId);
    if (index !== -1) {
      enquiries[index] = { ...enquiries[index], ...data, updatedAt: now };
      setAll(enquiries);
      return enquiries[index];
    }
  }

  const newEnquiry: Enquiry = {
    ...data,
    id: crypto.randomUUID(),
    enquiryNo: generateEnquiryNo(),
    createdAt: now,
    updatedAt: now,
  };
  enquiries.unshift(newEnquiry);
  setAll(enquiries);
  return newEnquiry;
}

export function deleteEnquiry(id: string): void {
  setAll(getAll().filter(e => e.id !== id));
}

export function updateEnquiryStatus(id: string, status: EnquiryStatus, closureReason?: string): void {
  const enquiries = getAll();
  const index = enquiries.findIndex(e => e.id === id);
  if (index !== -1) {
    enquiries[index].status = status;
    if (closureReason) enquiries[index].closureReason = closureReason;
    enquiries[index].updatedAt = new Date().toISOString();
    setAll(enquiries);
  }
}
