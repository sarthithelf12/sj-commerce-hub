import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GSTManagement = () => {
  const location = useLocation();
  const activeTab = location.pathname.includes("/delhi") ? "delhi" : 
                    location.pathname.includes("/maharashtra") ? "maharashtra" : "delhi";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">GST Management</h1>
          <p className="text-muted-foreground">Track input/output GST across states</p>
        </div>
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="delhi">Delhi GST</TabsTrigger>
            <TabsTrigger value="maharashtra">Maharashtra GST</TabsTrigger>
          </TabsList>
          <TabsContent value="delhi" className="space-y-4">
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              Delhi GST tracking coming soon.
            </div>
          </TabsContent>
          <TabsContent value="maharashtra" className="space-y-4">
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              Maharashtra GST tracking coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default GSTManagement;
