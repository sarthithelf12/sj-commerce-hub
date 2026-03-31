export type ExpenseCategory = 'rent' | 'salary' | 'transport' | 'utilities' | 'office' | 'marketing' | 'maintenance' | 'other';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'salary', label: 'Salary & Wages' },
  { value: 'transport', label: 'Transport & Logistics' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'other', label: 'Other' },
];

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo: string;
  paymentMode: 'cash' | 'bank' | 'upi' | 'cheque';
  reference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'erp_expenses';

function getAll(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function getExpenses(): Expense[] {
  return getAll();
}

export function getExpense(id: string): Expense | undefined {
  return getAll().find(e => e.id === id);
}

export function saveExpense(
  expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Expense {
  const expenses = getAll();
  const now = new Date().toISOString();

  if (existingId) {
    const index = expenses.findIndex(e => e.id === existingId);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...expense, updatedAt: now };
      setAll(expenses);
      return expenses[index];
    }
  }

  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  expenses.unshift(newExpense);
  setAll(expenses);
  return newExpense;
}

export function deleteExpense(id: string): void {
  setAll(getAll().filter(e => e.id !== id));
}

export function getExpensesByMonth(year: number, month: number): Expense[] {
  return getAll().filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getExpenseSummaryByCategory(): { category: string; label: string; total: number }[] {
  const all = getAll();
  return EXPENSE_CATEGORIES.map(cat => ({
    category: cat.value,
    label: cat.label,
    total: all.filter(e => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0),
  })).filter(s => s.total > 0);
}
