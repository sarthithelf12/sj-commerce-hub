import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, Receipt, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sales = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Manage all your sales transactions and documents</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/sales/tax-invoice/new")}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FilePlus className="h-5 w-5 text-primary" />
                Tax Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Create GST compliant tax invoices</p>
              <Button size="sm" variant="outline" className="w-full">Create New</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/sales/proforma/new")}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-5 w-5 text-info" />
                Proforma Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Create proforma invoices for advance billing</p>
              <Button size="sm" variant="outline" className="w-full">Create New</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/sales/delivery-challan/new")}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-5 w-5 text-warning" />
                Delivery Challan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Create delivery challans for goods dispatch</p>
              <Button size="sm" variant="outline" className="w-full">Create New</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Select a document type above to get started or view recent transactions.
        </div>
      </div>
    </AppLayout>
  );
};

export default Sales;
