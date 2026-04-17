import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentList } from "@/components/shared/DocumentList";
import { getDocuments, StoredDocument } from "@/utils/documentStorage";

const DeliveryChallans = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<StoredDocument[]>([]);

  const loadDocs = () => setDocs(getDocuments("delivery-challan"));
  useEffect(() => { loadDocs(); }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Delivery Challans</h1>
            <p className="text-muted-foreground">Manage all your delivery challans</p>
          </div>
          <Button onClick={() => navigate("/sales/delivery-challan/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Delivery Challan
          </Button>
        </div>
        <DocumentList
          documents={docs}
          type="delivery-challan"
          editBasePath="/sales/delivery-challan/edit"
          onRefresh={loadDocs}
          extraActions={(doc) =>
            doc.workflowStatus !== "invoiced" && doc.workflowStatus !== "paid" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                title="Generate Tax Invoice"
                onClick={() => navigate(`/sales/tax-invoice/new/from-delivery/${doc.id}`)}
              >
                <Receipt size={12} />
                Generate Invoice
              </Button>
            )
          }
        />
      </div>
    </AppLayout>
  );
};

export default DeliveryChallans;
