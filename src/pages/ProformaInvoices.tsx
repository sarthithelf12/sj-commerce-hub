import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentList } from "@/components/shared/DocumentList";
import { getDocuments, StoredDocument } from "@/utils/documentStorage";

const ProformaInvoices = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<StoredDocument[]>([]);

  const loadDocs = () => setDocs(getDocuments("proforma-invoice"));
  useEffect(() => { loadDocs(); }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proforma Invoices</h1>
            <p className="text-muted-foreground">Manage all your proforma invoices</p>
          </div>
          <Button onClick={() => navigate("/sales/proforma/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Proforma Invoice
          </Button>
        </div>
        <DocumentList
          documents={docs}
          type="proforma-invoice"
          editBasePath="/sales/proforma/edit"
          onRefresh={loadDocs}
        />
      </div>
    </AppLayout>
  );
};

export default ProformaInvoices;
