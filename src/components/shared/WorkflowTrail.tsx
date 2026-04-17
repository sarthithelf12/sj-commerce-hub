import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getChainForDocument, type WorkflowStage } from "@/utils/workflowStorage";

interface WorkflowTrailProps {
  documentId: string;
  /** Stage of the current document — used to highlight current node */
  currentStage?: WorkflowStage;
}

const STAGE_LABELS: Record<WorkflowStage, string> = {
  enquiry: "Enquiry",
  quotation: "Quotation",
  "client-po": "Client PO",
  "supplier-po": "Supplier PO",
  "delivery-challan": "Delivery Challan",
  "tax-invoice": "Tax Invoice",
  payment: "Payment",
};

const STAGE_ROUTES: Record<WorkflowStage, string> = {
  enquiry: "/enquiries/edit",
  quotation: "/documents/quotations/edit",
  "client-po": "/client-po/edit",
  "supplier-po": "/purchases/edit",
  "delivery-challan": "/sales/delivery-challan/edit",
  "tax-invoice": "/sales/tax-invoice/edit",
  payment: "/payments/edit",
};

export const WorkflowTrail = ({ documentId, currentStage }: WorkflowTrailProps) => {
  const navigate = useNavigate();
  const chain = useMemo(() => getChainForDocument(documentId), [documentId]);

  if (!chain.length) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No linked records yet. Conversions to other stages will appear here.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chain.map((node, idx) => {
        const isCurrent = node.documentId === documentId;
        return (
          <div key={node.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`${STAGE_ROUTES[node.stage]}/${node.documentId}`)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                isCurrent
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-foreground border-border hover:bg-muted/80"
              )}
              title={`${STAGE_LABELS[node.stage]} — ${node.documentNumber}`}
            >
              <span className="opacity-70 mr-1">{STAGE_LABELS[node.stage]}:</span>
              {node.documentNumber}
            </button>
            {idx < chain.length - 1 && (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
};
