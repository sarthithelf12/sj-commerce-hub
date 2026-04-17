import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentList } from "@/components/shared/DocumentList";
import { getDocuments, StoredDocument } from "@/utils/documentStorage";

const Quotations = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<StoredDocument[]>([]);

  const loadDocs = () => setDocs(getDocuments("quotation"));
  useEffect(() => { loadDocs(); }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quotations</h1>
            <p className="text-muted-foreground">Manage all your quotations</p>
          </div>
          <Button onClick={() => navigate("/documents/quotations/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </div>
        <DocumentList
          documents={docs}
          type="quotation"
          editBasePath="/documents/quotations/edit"
          onRefresh={loadDocs}
          extraActions={(doc) => (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              title="Mark as Client PO Received"
              onClick={() => navigate(`/client-po/new/from-quotation/${doc.id}`)}
            >
              <ClipboardCheck size={12} />
              Client PO
            </Button>
          )}
        />
      </div>
    </AppLayout>
  );
};

export default Quotations;
