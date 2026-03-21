

# Plan: Restructure Dashboard for ERP Business Flow

## Problem
The current dashboard shows generic quick actions and metrics that don't reflect the actual ERP workflow: Quotation → Client Order → Supplier PO → Payment → Material Receipt → Sale → Delivery.

## Changes

### 1. Redesign Quick Actions as a Business Flow Pipeline
Replace the flat grid of buttons with a visual pipeline showing the business process stages in order. Each stage is clickable and shows a count of pending items.

```text
Quotation → Purchase Order → Payment → Material In → Sale/Invoice → Delivery
   (3)          (5)           (2)        (4)           (6)           (3)
```

**File:** `src/components/dashboard/QuickActions.tsx` - Complete rewrite

### 2. Restructure Sidebar Navigation to Match Flow
Reorganize sidebar groups to follow the business lifecycle instead of arbitrary categories:

```text
Dashboard

SALES CYCLE
  Quotations          (send to clients)
  Proforma Invoices   (advance billing)
  Tax Invoices        (final billing)
  Delivery Challans   (dispatch goods)

PROCUREMENT
  Purchase Orders     (order from suppliers)
  Expenses            (payments & costs)
  Inventory           (stock management)

LOGISTICS
  Transport           (delivery tracking)

FINANCE
  Bank Management
  GST Management

REPORTS & MASTER
  Reports
  Parties
  Settings
```

**File:** `src/components/layout/AppSidebar.tsx`

### 3. Add Pending Actions / To-Do Section to Dashboard
Add a new "Pending Actions" component showing items that need attention, organized by workflow stage:

- Quotations awaiting client response
- POs pending supplier confirmation
- Payments due to suppliers
- Material deliveries expected
- Invoices pending dispatch
- Delivery challans in transit

**New file:** `src/components/dashboard/PendingActions.tsx`

### 4. Update Dashboard Layout
Rearrange the dashboard sections:

```text
[Header + Date]
[Business Flow Pipeline - visual stage indicators]
[Pending Actions (left 2/3)  |  GST Summary (right 1/3)]
[Metrics: Sales | Purchases | Receivables | Payables]
[Monthly Chart (left 2/3)    |  Recent Transactions (right 1/3)]
```

**File:** `src/pages/Dashboard.tsx`

### 5. Replace Metric Cards with Flow-Relevant KPIs
Update the 4 metric cards to reflect the procurement-to-sales cycle:

| Current | New |
|---------|-----|
| Monthly Sales | Total Receivables |
| Monthly Purchases | Total Payables |
| Expenses | Orders in Pipeline |
| Net Profit | Deliveries This Week |

**File:** `src/pages/Dashboard.tsx` (metric data updates)

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/dashboard/QuickActions.tsx` | Rewrite as flow pipeline |
| `src/components/dashboard/PendingActions.tsx` | New component |
| `src/components/layout/AppSidebar.tsx` | Reorganize nav groups |
| `src/pages/Dashboard.tsx` | New layout + metrics |

## Technical Notes
- All data remains mock/static for now (no backend)
- Pipeline stages use the existing routing paths
- Sidebar groups use the existing `NavItem` component pattern
- PendingActions uses existing Card components from shadcn

