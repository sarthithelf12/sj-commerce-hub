import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeliveryChallans = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Delivery Challans</h1>
            <p className="text-muted-foreground">Manage all your delivery challans</p>
          </div>
          <Button onClick={() => navigate("/documents/delivery-challans/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Delivery Challan
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No delivery challans yet. Create your first delivery challan to get started.
        </div>
      </div>
    </AppLayout>
  );
};

export default DeliveryChallans;
