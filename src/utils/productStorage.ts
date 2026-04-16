export interface Product {
  id: string;
  productCode: string;
  name: string;
  hsnCode: string;
  unit: string;
  category: string;
  defaultTaxRate: number;
  purchasePrice: number;
  sellingPrice: number;
  minStockLevel: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'sjmart_products';

function getAll(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function generateProductCode(): string {
  const all = getAll();
  const existing = all
    .map(p => {
      const match = p.productCode.match(/SJ-PRD-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `SJ-PRD-${String(next).padStart(4, '0')}`;
}

export function getProducts(): Product[] {
  return getAll();
}

export function getProduct(id: string): Product | undefined {
  return getAll().find(p => p.id === id);
}

export function getProductByCode(code: string): Product | undefined {
  return getAll().find(p => p.productCode === code);
}

export function saveProduct(
  data: Omit<Product, 'id' | 'productCode' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Product {
  const products = getAll();
  const now = new Date().toISOString();

  if (existingId) {
    const index = products.findIndex(p => p.id === existingId);
    if (index !== -1) {
      products[index] = { ...products[index], ...data, updatedAt: now };
      setAll(products);
      return products[index];
    }
  }

  const newProduct: Product = {
    ...data,
    id: crypto.randomUUID(),
    productCode: generateProductCode(),
    createdAt: now,
    updatedAt: now,
  };
  products.unshift(newProduct);
  setAll(products);
  return newProduct;
}

export function deleteProduct(id: string): void {
  setAll(getAll().filter(p => p.id !== id));
}

// Compute stock for a product: total purchased (from POs) - total delivered (from DCs)
export function getProductStock(productId: string): number {
  const totalPurchased = getProductPurchasedQty(productId);
  const totalDelivered = getProductDeliveredQty(productId);
  return totalPurchased - totalDelivered;
}

export function getProductPurchasedQty(productId: string): number {
  try {
    const raw = localStorage.getItem('erp_documents');
    const docs = raw ? JSON.parse(raw) : [];
    let total = 0;
    for (const doc of docs) {
      if (doc.type === 'purchase-order' && doc.data?.items) {
        for (const item of doc.data.items as Array<Record<string, unknown>>) {
          if (item.productId === productId) {
            total += Number(item.quantity) || 0;
          }
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
}

export function getProductDeliveredQty(productId: string): number {
  try {
    const raw = localStorage.getItem('erp_documents');
    const docs = raw ? JSON.parse(raw) : [];
    let total = 0;
    for (const doc of docs) {
      if (doc.type === 'delivery-challan' && doc.data?.items) {
        for (const item of doc.data.items as Array<Record<string, unknown>>) {
          if (item.productId === productId) {
            total += Number(item.quantity) || 0;
          }
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
}

// Get all products with computed stock
export function getProductsWithStock(): (Product & { currentStock: number; purchased: number; delivered: number })[] {
  return getAll().map(p => ({
    ...p,
    purchased: getProductPurchasedQty(p.id),
    delivered: getProductDeliveredQty(p.id),
    currentStock: getProductStock(p.id),
  }));
}
