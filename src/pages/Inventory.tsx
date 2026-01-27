import { AppLayout } from "@/components/layout/AppLayout";

const Inventory = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage your stock and inventory</p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Inventory module coming soon.
        </div>
      </div>
    </AppLayout>
  );
};

export default Inventory;
