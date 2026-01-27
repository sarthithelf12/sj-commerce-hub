import { AppLayout } from "@/components/layout/AppLayout";

const Parties = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Parties</h1>
          <p className="text-muted-foreground">Manage customers and suppliers</p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Parties module coming soon.
        </div>
      </div>
    </AppLayout>
  );
};

export default Parties;
