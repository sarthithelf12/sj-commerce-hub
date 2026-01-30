import { AppLayout } from "@/components/layout/AppLayout";
import { TaxInvoiceForm } from "@/components/sales/TaxInvoiceForm";

const TaxInvoiceNew = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Tax Invoice</h1>
          <p className="text-muted-foreground">Generate a GST compliant tax invoice</p>
        </div>
        <TaxInvoiceForm />
      </div>
    </AppLayout>
  );
};

export default TaxInvoiceNew;
