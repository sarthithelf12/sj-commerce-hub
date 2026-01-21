import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BankManagement from "./pages/BankManagement";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bank" element={<AppLayout><BankManagement /></AppLayout>} />
          <Route path="/bank/transactions" element={<AppLayout><BankManagement /></AppLayout>} />
          <Route path="/bank/matching" element={<AppLayout><BankManagement /></AppLayout>} />
          <Route path="/bank/guarantees" element={<AppLayout><BankManagement /></AppLayout>} />
          <Route path="/bank/loans" element={<AppLayout><BankManagement /></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
