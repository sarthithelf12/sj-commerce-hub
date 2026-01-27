import { AppLayout } from "@/components/layout/AppLayout";

const Reports = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View business reports and analytics</p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Reports module coming soon.
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
