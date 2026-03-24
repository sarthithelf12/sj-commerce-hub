import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentList } from "@/components/shared/DocumentList";
import { getDocuments, StoredDocument } from "@/utils/documentStorage";

const TaxInvoices = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<StoredDocument[]>([]);

  const loadDocs = () => setDocs(getDocuments("tax-invoice"));
  useEffect(() => { loadDocs(); }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tax Invoices</h1>
            <p className="text-muted-foreground">Manage all your tax invoices</p>
          </div>
          <Button onClick={() => navigate("/sales/tax-invoice/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Tax Invoice
          </Button>
        </div>
        <DocumentList
          documents={docs}
          type="tax-invoice"
          editBasePath="/sales/tax-invoice/edit"
          onRefresh={loadDocs}
        />
      </div>
    </AppLayout>
  );
};

export default TaxInvoices;
