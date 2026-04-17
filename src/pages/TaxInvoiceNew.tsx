import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { TaxInvoiceForm } from "@/components/sales/TaxInvoiceForm";

const TaxInvoiceNew = () => {
  const { id, deliveryId } = useParams();
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{id ? "Edit Tax Invoice" : "Create Tax Invoice"}</h1>
          <p className="text-muted-foreground">Generate a GST compliant tax invoice</p>
        </div>
        <TaxInvoiceForm existingId={id} sourceDeliveryId={deliveryId} />
      </div>
    </AppLayout>
  );
};

export default TaxInvoiceNew;
