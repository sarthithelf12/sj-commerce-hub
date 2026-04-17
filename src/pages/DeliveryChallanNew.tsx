import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DeliveryChallanForm } from "@/components/sales/DeliveryChallanForm";

const DeliveryChallanNew = () => {
  const { id, supplierPoId } = useParams();
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{id ? "Edit Delivery Challan" : "Create Delivery Challan"}</h1>
          <p className="text-muted-foreground">Generate a delivery challan for goods dispatch</p>
        </div>
        <DeliveryChallanForm existingId={id} sourceSupplierPoId={supplierPoId} />
      </div>
    </AppLayout>
  );
};

export default DeliveryChallanNew;
