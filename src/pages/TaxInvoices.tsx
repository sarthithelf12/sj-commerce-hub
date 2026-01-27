import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TaxInvoices = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tax Invoices</h1>
            <p className="text-muted-foreground">Manage all your tax invoices</p>
          </div>
          <Button onClick={() => navigate("/documents/tax-invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Tax Invoice
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No tax invoices yet. Create your first tax invoice to get started.
        </div>
      </div>
    </AppLayout>
  );
};

export default TaxInvoices;
