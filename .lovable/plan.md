
# Plan: Add Configurable Company Name for Billing Details

## Overview
Currently, all document forms (Quotation, Tax Invoice, Proforma Invoice, Delivery Challan, Purchase Order) have the company information hardcoded as a constant `COMPANY_INFO` within each form component. You want the ability to save and configure the company name for billing details across both Sales and Purchase documents.

## Current State Analysis
- Each form has its own duplicate `COMPANY_INFO` constant:
  - `QuotationForm.tsx` - lines 33-46
  - `TaxInvoiceForm.tsx` - lines 33-46
  - `ProformaInvoiceForm.tsx` - lines 34-47
  - `DeliveryChallanForm.tsx` - lines 37-45
  - `PurchaseOrderForm.tsx` - lines 33-46

- All contain the same SJMART PRIVATE LIMITED details
- Settings page is currently a placeholder

## Solution Approach

### Phase 1: Centralize Company Configuration
Create a shared configuration that all forms can import, making it easier to update company details in one place.

**New file: `src/config/companyInfo.ts`**
```text
Single source of truth for company billing details:
- Company name, address, GSTIN, PAN
- Contact details (phone, email)
- Bank account information (ICICI Bank/Noida)
- State for GST inter/intra-state calculations
```

### Phase 2: Update All Form Components
Modify each form to import from the central configuration instead of defining their own constants.

**Files to update:**
1. `src/components/quotation/QuotationForm.tsx`
2. `src/components/sales/TaxInvoiceForm.tsx`
3. `src/components/sales/ProformaInvoiceForm.tsx`
4. `src/components/sales/DeliveryChallanForm.tsx`
5. `src/components/purchase/PurchaseOrderForm.tsx`

### Phase 3: Build Settings Page UI
Create a functional Settings page where you can view and (in the future) edit company details.

**Updates to `src/pages/Settings.tsx`:**
- Display current company information in an organized card layout
- Show sections for:
  - Business Identity (Name, GSTIN, PAN)
  - Contact Details (Address, Phone, Email)
  - Bank Information (Account details)
- Add "Edit" functionality (initially display-only, can be made editable later)

## Implementation Order
1. Create `src/config/companyInfo.ts` with centralized company data
2. Update all 5 form components to import from the new config
3. Build the Settings page UI to display company information
4. (Future) Add database persistence with Lovable Cloud for saving edited company details

## Benefits
- Single place to update company information
- Consistent branding across all documents
- Foundation for multi-company support in the future
- Settings page provides visibility into current configuration

---

## Technical Details

### File Structure
```text
src/
  config/
    companyInfo.ts        (NEW - centralized config)
  components/
    quotation/
      QuotationForm.tsx   (UPDATE - import from config)
    sales/
      TaxInvoiceForm.tsx  (UPDATE - import from config)
      ProformaInvoiceForm.tsx (UPDATE - import from config)
      DeliveryChallanForm.tsx (UPDATE - import from config)
    purchase/
      PurchaseOrderForm.tsx   (UPDATE - import from config)
  pages/
    Settings.tsx          (UPDATE - display company info)
```

### Company Info Interface
```text
interface CompanyInfo {
  name: string
  address: string
  gstin: string
  pan: string
  phone: string
  email: string
  state: string
  bankName: string
  accountName: string
  accountNumber: string
  ifsc: string
  branch: string
}
```

### Settings Page Layout
```text
+------------------------------------------+
| Settings                                  |
| Configure your business settings          |
+------------------------------------------+
| Business Identity        | Contact Info  |
| - SJMART PRIVATE LIMITED | - Address     |
| - GSTIN: 07ABPCS...      | - Phone       |
| - PAN: ABPCS9776C        | - Email       |
+------------------------------------------+
| Bank Information                         |
| - ICICI BANK / Noida                     |
| - Account: 706205500002                  |
| - IFSC: ICICI0007062                     |
+------------------------------------------+
```
