

# Plan: Add Document Listing with Search, Download & Edit to All List Pages

## Overview
All 5 document list pages (Quotations, Tax Invoices, Proforma Invoices, Delivery Challans, Purchase Orders) are currently empty placeholders. Replace them with functional listing tables showing previously created documents, with search/filter, download PDF, and edit capabilities.

Since there is no database yet, documents will be stored in localStorage so they persist across sessions until a backend is connected.

## Changes

### 1. Create a Reusable Document List Component
**New file:** `src/components/shared/DocumentList.tsx`

A generic, reusable table component that all 5 list pages will use. Features:
- **Search bar** at the top (filters by document number, customer/supplier name)
- **Sortable table** with columns: S.No, Doc Number, Date, Party Name, Amount, Status
- **Action buttons** per row: View/Download PDF, Edit, Delete
- **Status badges**: Draft, Sent, Accepted, etc.
- **Empty state** when no documents exist

### 2. Create a Document Storage Utility
**New file:** `src/utils/documentStorage.ts`

LocalStorage-based CRUD operations:
- `saveDocument(type, data)` - saves a quotation/invoice/PO
- `getDocuments(type)` - retrieves all documents of a type
- `getDocument(type, id)` - retrieves a single document
- `deleteDocument(type, id)` - removes a document
- Document types: `quotation`, `tax-invoice`, `proforma-invoice`, `delivery-challan`, `purchase-order`

### 3. Update All 5 List Pages
Replace placeholder content with the `DocumentList` component, configured per document type.

**Files to update:**
- `src/pages/Quotations.tsx`
- `src/pages/TaxInvoices.tsx`
- `src/pages/ProformaInvoices.tsx`
- `src/pages/DeliveryChallans.tsx`
- `src/pages/Purchases.tsx`

### 4. Update All 5 Form Components to Save on Submit
When the user clicks "Generate Quotation" (or equivalent), save the document data to localStorage so it appears in the list.

**Files to update:**
- `src/components/quotation/QuotationForm.tsx`
- `src/components/sales/TaxInvoiceForm.tsx`
- `src/components/sales/ProformaInvoiceForm.tsx`
- `src/components/sales/DeliveryChallanForm.tsx`
- `src/components/purchase/PurchaseOrderForm.tsx`

### 5. Add Edit Routes
Add routes for editing existing documents (reuse the same form components, pre-populated with saved data).

**File:** `src/App.tsx` - add routes like `/documents/quotations/edit/:id`

## Document List Layout
```text
+----------------------------------------------------------+
| Quotations                          [+ New Quotation]    |
| Manage all your quotations                               |
+----------------------------------------------------------+
| [🔍 Search by number, customer...]   [Filter ▼] [Sort ▼]|
+----------------------------------------------------------+
| # | Doc No.        | Date       | Customer    | Amount   | Status | Actions     |
|---|----------------|------------|-------------|----------|--------|-------------|
| 1 | SJ/DL/01/0030  | 2026-03-20 | ABC Corp    | ₹45,000  | Draft  | 📄 ✏️ 🗑️  |
| 2 | SJ/DL/01/0029  | 2026-03-18 | XYZ Ltd     | ₹1,20,000| Sent   | 📄 ✏️ 🗑️  |
+----------------------------------------------------------+
```

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/shared/DocumentList.tsx` | New - reusable list component |
| `src/utils/documentStorage.ts` | New - localStorage CRUD |
| `src/pages/Quotations.tsx` | Update with document list |
| `src/pages/TaxInvoices.tsx` | Update with document list |
| `src/pages/ProformaInvoices.tsx` | Update with document list |
| `src/pages/DeliveryChallans.tsx` | Update with document list |
| `src/pages/Purchases.tsx` | Update with document list |
| `src/components/quotation/QuotationForm.tsx` | Add save on submit |
| `src/components/sales/TaxInvoiceForm.tsx` | Add save on submit |
| `src/components/sales/ProformaInvoiceForm.tsx` | Add save on submit |
| `src/components/sales/DeliveryChallanForm.tsx` | Add save on submit |
| `src/components/purchase/PurchaseOrderForm.tsx` | Add save on submit |
| `src/App.tsx` | Add edit routes |

## Implementation Order
1. Create `documentStorage.ts` utility
2. Create `DocumentList.tsx` reusable component
3. Update all 5 list pages to use `DocumentList`
4. Update all 5 form components to save documents on submit
5. Add edit routes to `App.tsx` and wire up form pre-population

