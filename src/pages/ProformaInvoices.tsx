import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProformaInvoices = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proforma Invoices</h1>
            <p className="text-muted-foreground">Manage all your proforma invoices</p>
          </div>
          <Button onClick={() => navigate("/documents/proforma/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Proforma Invoice
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No proforma invoices yet. Create your first proforma invoice to get started.
        </div>
      </div>
    </AppLayout>
  );
};

export default ProformaInvoices;
