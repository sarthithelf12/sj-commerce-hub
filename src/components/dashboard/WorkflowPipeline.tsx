import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, GitBranch } from "lucide-react";
import { getEnquiries } from "@/utils/enquiryStorage";
import { getDocuments } from "@/utils/documentStorage";
import { getTotalReceivedForInvoice } from "@/utils/paymentStorage";

interface PipelineStep {
  label: string;
  count: number;
  path: string;
}

export const WorkflowPipeline = () => {
  const navigate = useNavigate();

  const steps: PipelineStep[] = useMemo(() => {
    const openEnquiries = getEnquiries().filter(
      (e) => e.status === "open" || e.status === "quoted"
    ).length;

    const quotations = getDocuments("quotation");
    const quotesPendingPo = quotations.filter(
      (q) => q.workflowStatus !== "po-received" && q.status !== "accepted"
    ).length;

    const supplierPos = getDocuments("purchase-order");
    const posPendingDelivery = supplierPos.filter(
      (p) => p.workflowStatus !== "delivered"
    ).length;

    const invoices = getDocuments("tax-invoice");
    const invoicesPendingPayment = invoices.filter(
      (inv) => getTotalReceivedForInvoice(inv.id) < inv.amount
    ).length;

    return [
      { label: "Open Enquiries", count: openEnquiries, path: "/enquiries" },
      { label: "Quotes Pending PO", count: quotesPendingPo, path: "/documents/quotations" },
      { label: "POs Pending Delivery", count: posPendingDelivery, path: "/purchases" },
      { label: "Invoices Pending Payment", count: invoicesPendingPayment, path: "/sales/tax-invoices" },
    ];
  }, []);

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-2 p-5 pb-3 border-b border-border">
        <GitBranch size={18} className="text-primary" />
        <h3 className="text-base font-semibold text-foreground">Workflow Pipeline</h3>
      </div>
      <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(step.path)}
              className="flex-1 text-left p-3 rounded-md border border-border hover:bg-muted/40 transition-colors"
            >
              <p className="text-2xl font-bold text-foreground">{step.count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.label}</p>
            </button>
            {idx < steps.length - 1 && (
              <ArrowRight size={16} className="text-muted-foreground hidden lg:block shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
