import { AppLayout } from "@/components/layout/AppLayout";

const Sales = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track all your sales transactions</p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Sales module coming soon.
        </div>
      </div>
    </AppLayout>
  );
};

export default Sales;
