

# Plan: Build Enquiry Module

## Overview
Create a complete Enquiry module as the first step in the order workflow pipeline. This adds a storage utility, a list page with stats/search/filters, a create/edit form page, and wires everything into the sidebar and router.

## Files to Create

### 1. `src/utils/enquiryStorage.ts`
localStorage CRUD following `partyStorage.ts` pattern:
- Types: `EnquiryStatus`, `EnquiryItem`, `Enquiry` (as specified)
- Storage key: `sjmart_enquiries`
- Functions: `getEnquiries`, `getEnquiry`, `saveEnquiry`, `deleteEnquiry`, `updateEnquiryStatus`
- Auto-generate enquiry numbers: `ENQ/2526/001` format (FY-based, auto-incrementing)

### 2. `src/pages/Enquiries.tsx`
List page following the `Parties.tsx` pattern (stats cards + search + filter + table):
- 4 stat cards: Total, Open, Won, Lost/Cancelled
- Search bar (enquiry number, customer name) + status filter dropdown
- Table: Enquiry No, Date, Customer, Items count, Status (color-coded Badge), Actions
- Actions: Edit (navigate), Convert to Quotation (toast placeholder), Delete (with confirmation)

### 3. `src/pages/EnquiryNew.tsx`
Form page for create/edit, route params for edit mode (`/enquiries/edit/:id`):
- **Enquiry Info**: Auto-generated number (read-only), date picker (default today)
- **Customer**: Dropdown from `getParties('customer')`, shows address/phone when selected, option to type manually
- **Items**: Dynamic rows (product, description, quantity, unit) with add/remove, min 1 required
- **Notes**: Optional textarea
- **Footer**: Cancel + Save as Draft buttons
- On edit: pre-fill from `getEnquiry(id)`

## Files to Edit

### 4. `src/components/layout/AppSidebar.tsx`
- Import `ClipboardList` from lucide-react
- Add "Enquiries" as first item under "Sales Cycle" section (before Quotations)

### 5. `src/App.tsx`
- Import `Enquiries` and `EnquiryNew`
- Add routes: `/enquiries`, `/enquiries/new`, `/enquiries/edit/:id`

## Implementation Order
1. Create `enquiryStorage.ts`
2. Create `Enquiries.tsx` list page
3. Create `EnquiryNew.tsx` form page
4. Update `AppSidebar.tsx` and `App.tsx`

