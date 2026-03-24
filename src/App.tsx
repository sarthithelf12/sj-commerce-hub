import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BankManagement from "./pages/BankManagement";
import QuotationNew from "./pages/QuotationNew";
import PurchaseOrderNew from "./pages/PurchaseOrderNew";
import TaxInvoiceNew from "./pages/TaxInvoiceNew";
import ProformaInvoiceNew from "./pages/ProformaInvoiceNew";
import DeliveryChallanNew from "./pages/DeliveryChallanNew";
import Quotations from "./pages/Quotations";
import ProformaInvoices from "./pages/ProformaInvoices";
import TaxInvoices from "./pages/TaxInvoices";
import DeliveryChallans from "./pages/DeliveryChallans";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import GSTManagement from "./pages/GSTManagement";
import Reports from "./pages/Reports";
import Parties from "./pages/Parties";
import Transport from "./pages/Transport";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Documents - Quotations */}
          <Route path="/documents/quotations" element={<Quotations />} />
          <Route path="/documents/quotations/new" element={<QuotationNew />} />
          <Route path="/documents/quotations/edit/:id" element={<QuotationNew />} />
          
          {/* Sales - Tax Invoices, Proforma, Delivery Challans */}
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/tax-invoice/new" element={<TaxInvoiceNew />} />
          <Route path="/sales/tax-invoice/edit/:id" element={<TaxInvoiceNew />} />
          <Route path="/sales/proforma/new" element={<ProformaInvoiceNew />} />
          <Route path="/sales/proforma/edit/:id" element={<ProformaInvoiceNew />} />
          <Route path="/sales/delivery-challan/new" element={<DeliveryChallanNew />} />
          <Route path="/sales/delivery-challan/edit/:id" element={<DeliveryChallanNew />} />
          <Route path="/sales/tax-invoices" element={<TaxInvoices />} />
          <Route path="/sales/proforma" element={<ProformaInvoices />} />
          <Route path="/sales/delivery-challans" element={<DeliveryChallans />} />
          
          {/* Purchases - Purchase Orders */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/new" element={<PurchaseOrderNew />} />
          <Route path="/purchases/edit/:id" element={<PurchaseOrderNew />} />
          
          {/* Other Transactions */}
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/inventory" element={<Inventory />} />
          
          {/* Banking */}
          <Route path="/bank" element={<BankManagement />} />
          <Route path="/bank/transactions" element={<BankManagement />} />
          <Route path="/bank/matching" element={<BankManagement />} />
          <Route path="/bank/guarantees" element={<BankManagement />} />
          <Route path="/bank/loans" element={<BankManagement />} />
          
          {/* GST */}
          <Route path="/gst" element={<GSTManagement />} />
          <Route path="/gst/delhi" element={<GSTManagement />} />
          <Route path="/gst/maharashtra" element={<GSTManagement />} />
          
          {/* Other */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
