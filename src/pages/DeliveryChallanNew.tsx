import { AppLayout } from "@/components/layout/AppLayout";
import { DeliveryChallanForm } from "@/components/sales/DeliveryChallanForm";

const DeliveryChallanNew = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Delivery Challan</h1>
          <p className="text-muted-foreground">Generate a delivery challan for goods dispatch</p>
        </div>
        <DeliveryChallanForm />
      </div>
    </AppLayout>
  );
};

export default DeliveryChallanNew;
