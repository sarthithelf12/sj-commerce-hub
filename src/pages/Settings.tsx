import { AppLayout } from "@/components/layout/AppLayout";

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your business settings</p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Settings module coming soon.
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
