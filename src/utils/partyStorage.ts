export type PartyType = 'customer' | 'supplier' | 'both';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  contactPerson: string;
  paymentTerms: string;
  openingBalance: number;
  balanceType: 'receivable' | 'payable';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'erp_parties';

function getAll(): Party[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll(parties: Party[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
}

export function getParties(type?: PartyType): Party[] {
  const all = getAll();
  if (!type) return all;
  return all.filter(p => p.type === type || p.type === 'both');
}

export function getParty(id: string): Party | undefined {
  return getAll().find(p => p.id === id);
}

export function saveParty(party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string): Party {
  const parties = getAll();
  const now = new Date().toISOString();

  if (existingId) {
    const index = parties.findIndex(p => p.id === existingId);
    if (index !== -1) {
      parties[index] = { ...parties[index], ...party, updatedAt: now };
      setAll(parties);
      return parties[index];
    }
  }

  const newParty: Party = {
    ...party,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  parties.unshift(newParty);
  setAll(parties);
  return newParty;
}

export function deleteParty(id: string): void {
  setAll(getAll().filter(p => p.id !== id));
}
