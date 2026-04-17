import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentList } from "@/components/shared/DocumentList";
import { getDocuments, StoredDocument } from "@/utils/documentStorage";

const Purchases = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<StoredDocument[]>([]);

  const loadDocs = () => setDocs(getDocuments("purchase-order"));
  useEffect(() => { loadDocs(); }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage all your purchase orders</p>
          </div>
          <Button onClick={() => navigate("/purchases/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        </div>
        <DocumentList
          documents={docs}
          type="purchase-order"
          editBasePath="/purchases/edit"
          onRefresh={loadDocs}
          extraActions={(doc) =>
            doc.workflowStatus !== "delivered" && doc.workflowStatus !== "invoiced" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                title="Generate Delivery Challan"
                onClick={() => navigate(`/sales/delivery-challan/new/from-supplier-po/${doc.id}`)}
              >
                <Truck size={12} />
                Generate DC
              </Button>
            )
          }
        />
      </div>
    </AppLayout>
  );
};

export default Purchases;
