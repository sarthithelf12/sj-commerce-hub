import { AppLayout } from "@/components/layout/AppLayout";
import { PurchaseOrderForm } from "@/components/purchase/PurchaseOrderForm";

const PurchaseOrderNew = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Purchase Order</h1>
          <p className="text-muted-foreground">Create a purchase order for your supplier</p>
        </div>
        <PurchaseOrderForm />
      </div>
    </AppLayout>
  );
};

export default PurchaseOrderNew;
