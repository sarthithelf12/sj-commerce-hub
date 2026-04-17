export type PaymentMode = 'neft' | 'rtgs' | 'cheque' | 'cash' | 'upi';
export type PaymentStatus = 'partial' | 'paid';

export interface Payment {
  id: string;
  paymentRef: string;       // Auto: PAY/2526/001
  date: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  amountReceived: number;
  paymentMode: PaymentMode;
  bankRef: string;
  pendingAmount: number;
  workflowStatus: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'sjmart_payments';

function readAll(): Payment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: Payment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function generatePaymentRef(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  const fyCode = `${String(fyStart).slice(2)}${String(fyEnd).slice(2)}`;
  const prefix = `PAY/${fyCode}/`;
  const all = readAll();
  const existing = all
    .filter(p => p.paymentRef.startsWith(prefix))
    .map(p => parseInt(p.paymentRef.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function getPayments(): Payment[] {
  return readAll();
}

export function getPayment(id: string): Payment | undefined {
  return readAll().find(p => p.id === id);
}

export function getPaymentsForInvoice(invoiceId: string): Payment[] {
  return readAll().filter(p => p.invoiceId === invoiceId);
}

export function getTotalReceivedForInvoice(invoiceId: string): number {
  return getPaymentsForInvoice(invoiceId).reduce((sum, p) => sum + (Number(p.amountReceived) || 0), 0);
}

export function savePayment(
  data: Omit<Payment, 'id' | 'paymentRef' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Payment {
  const all = readAll();
  const now = new Date().toISOString();

  if (existingId) {
    const idx = all.findIndex(p => p.id === existingId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data, updatedAt: now };
      writeAll(all);
      return all[idx];
    }
  }

  const created: Payment = {
    ...data,
    id: crypto.randomUUID(),
    paymentRef: generatePaymentRef(),
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(created);
  writeAll(all);
  return created;
}

export function deletePayment(id: string): void {
  writeAll(readAll().filter(p => p.id !== id));
}
