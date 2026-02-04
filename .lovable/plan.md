

# Plan: Add PDF Download Functionality to All Document Forms

## Overview
Add the ability to download Purchase Orders, Quotations, Tax Invoices, Proforma Invoices, and Delivery Challans as PDF files. Users will be able to review the document and download it with a single click.

## Solution Approach

### Library Selection: `react-to-pdf`
This lightweight library converts any React component to PDF using html2canvas and jsPDF under the hood. It provides a simple hook-based API that works well with the existing form structure.

**Why `react-to-pdf`:**
- Simple `usePDF` hook with TypeScript support
- Works with existing JSX - no need to rewrite components
- Customizable page size, margins, and quality settings
- Actively maintained with good documentation

## Implementation Strategy

### Phase 1: Install PDF Library
Add the `react-to-pdf` package to the project dependencies.

### Phase 2: Create Reusable PDF Wrapper Component
Build a reusable component that wraps document content and provides the download button. This ensures consistent PDF styling across all forms.

**New file: `src/components/shared/PDFDownloadWrapper.tsx`**
- Accepts children (the document content to convert)
- Provides "Download PDF" button with proper styling
- Configures PDF settings (A4 size, margins, filename)
- Shows loading state during generation

### Phase 3: Create Print-Optimized Document Components
Each form will have a corresponding "preview" version optimized for PDF output:

| Form | Preview Component |
|------|-------------------|
| Purchase Order | `PurchaseOrderPreview.tsx` |
| Quotation | `QuotationPreview.tsx` |
| Tax Invoice | `TaxInvoicePreview.tsx` |
| Proforma Invoice | `ProformaInvoicePreview.tsx` |
| Delivery Challan | `DeliveryChallanPreview.tsx` |

These components:
- Receive form data as props
- Display in a clean, print-friendly layout
- Include company letterhead styling
- Show "Authorised Signatory" section

### Phase 4: Update Form Components
Modify each form to:
1. Add a "Preview & Download" button alongside existing buttons
2. Show a dialog/modal with the PDF preview
3. Include "Download PDF" action in the preview
4. Pass current form state to the preview component

### User Flow
```text
1. User fills out the form (e.g., Purchase Order)
2. User clicks "Preview & Download PDF"
3. Modal opens showing the document in print layout
4. User clicks "Download PDF" button
5. PDF file downloads with appropriate filename
   (e.g., "PO_SJ_DL_25_0013.pdf")
```

---

## Technical Details

### File Structure
```text
src/
  components/
    shared/
      PDFDownloadWrapper.tsx    (NEW - reusable PDF wrapper)
    purchase/
      PurchaseOrderForm.tsx     (UPDATE - add preview button)
      PurchaseOrderPreview.tsx  (NEW - print layout)
    quotation/
      QuotationForm.tsx         (UPDATE - add preview button)
      QuotationPreview.tsx      (NEW - print layout)
    sales/
      TaxInvoiceForm.tsx        (UPDATE - add preview button)
      TaxInvoicePreview.tsx     (NEW - print layout)
      ProformaInvoiceForm.tsx   (UPDATE - add preview button)
      ProformaInvoicePreview.tsx (NEW - print layout)
      DeliveryChallanForm.tsx   (UPDATE - add preview button)
      DeliveryChallanPreview.tsx (NEW - print layout)
```

### PDF Wrapper Component Interface
```text
interface PDFDownloadWrapperProps {
  filename: string;           // e.g., "PO_SJ_DL_25_0013"
  documentTitle: string;      // e.g., "Purchase Order"
  children: React.ReactNode;  // The document content
  onClose: () => void;        // Close the preview modal
}
```

### PDF Configuration
```text
Options:
- Format: A4
- Orientation: Portrait
- Resolution: High (for crisp text)
- Margins: 10mm all sides
- Quality: 1.0 for sharp output
```

### Form Data Interface (Example for PO)
```text
interface PurchaseOrderData {
  poNo: string;
  date: string;
  supplierName: string;
  supplierAddress: string;
  supplierState: string;
  supplierGstin: string;
  items: LineItem[];
  calculations: CalculationResult;
  deliveryTimeline: string;
  paymentTerms: string;
  remarks: string;
  shippingAddress: ShippingAddress;
}
```

### Updated Action Buttons Layout
```text
Current:
[Save as Draft] [Generate Purchase Order]

Updated:
[Save as Draft] [Preview & Download PDF] [Generate Purchase Order]
```

### Preview Modal Layout
```text
+------------------------------------------+
| Preview: Purchase Order        [X Close] |
+------------------------------------------+
|                                          |
|   [Document rendered in print format]    |
|                                          |
+------------------------------------------+
| [Download PDF]              [Close]      |
+------------------------------------------+
```

## Implementation Order
1. Install `react-to-pdf` package
2. Create `PDFDownloadWrapper.tsx` component
3. Create `PurchaseOrderPreview.tsx` and update `PurchaseOrderForm.tsx`
4. Create `QuotationPreview.tsx` and update `QuotationForm.tsx`
5. Create `TaxInvoicePreview.tsx` and update `TaxInvoiceForm.tsx`
6. Create `ProformaInvoicePreview.tsx` and update `ProformaInvoiceForm.tsx`
7. Create `DeliveryChallanPreview.tsx` and update `DeliveryChallanForm.tsx`

## Benefits
- Users can review documents before downloading
- Professional PDF output matching the on-screen preview
- Consistent branding with company letterhead
- Reusable pattern for future document types

