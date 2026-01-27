import { AppLayout } from "@/components/layout/AppLayout";

const Expenses = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track all your business expenses</p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Expenses module coming soon.
        </div>
      </div>
    </AppLayout>
  );
};

export default Expenses;
