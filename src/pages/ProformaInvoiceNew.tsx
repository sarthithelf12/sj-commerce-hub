import { AppLayout } from "@/components/layout/AppLayout";
import { ProformaInvoiceForm } from "@/components/sales/ProformaInvoiceForm";

const ProformaInvoiceNew = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Proforma Invoice</h1>
          <p className="text-muted-foreground">Generate a proforma invoice for advance billing</p>
        </div>
        <ProformaInvoiceForm />
      </div>
    </AppLayout>
  );
};

export default ProformaInvoiceNew;
