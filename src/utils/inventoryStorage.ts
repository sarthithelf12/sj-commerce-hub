export interface InventoryItem {
  id: string;
  name: string;
  hsnCode: string;
  unit: string;
  category: string;
  defaultTaxRate: number;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  reference: string;
  date: string;
  createdAt: string;
}

const ITEMS_KEY = 'erp_inventory_items';
const MOVEMENTS_KEY = 'erp_stock_movements';

function getItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setItems(items: InventoryItem[]) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function getMovements(): StockMovement[] {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setMovements(movements: StockMovement[]) {
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
}

export function getInventoryItems(): InventoryItem[] {
  return getItems();
}

export function getInventoryItem(id: string): InventoryItem | undefined {
  return getItems().find(i => i.id === id);
}

export function saveInventoryItem(
  item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): InventoryItem {
  const items = getItems();
  const now = new Date().toISOString();

  if (existingId) {
    const index = items.findIndex(i => i.id === existingId);
    if (index !== -1) {
      items[index] = { ...items[index], ...item, updatedAt: now };
      setItems(items);
      return items[index];
    }
  }

  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(newItem);
  setItems(items);
  return newItem;
}

export function deleteInventoryItem(id: string): void {
  setItems(getItems().filter(i => i.id !== id));
}

export function addStockMovement(itemId: string, type: 'in' | 'out', quantity: number, reference: string): void {
  const movements = getMovements();
  movements.unshift({
    id: crypto.randomUUID(),
    itemId,
    type,
    quantity,
    reference,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  });
  setMovements(movements);

  // Update stock level
  const items = getItems();
  const index = items.findIndex(i => i.id === itemId);
  if (index !== -1) {
    items[index].currentStock += type === 'in' ? quantity : -quantity;
    items[index].updatedAt = new Date().toISOString();
    setItems(items);
  }
}

export function getStockMovements(itemId?: string): StockMovement[] {
  const all = getMovements();
  return itemId ? all.filter(m => m.itemId === itemId) : all;
}

export function getLowStockItems(): InventoryItem[] {
  return getItems().filter(i => i.currentStock <= i.minStockLevel);
}
