import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Pencil, Trash2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPayments, deletePayment, type Payment } from "@/utils/paymentStorage";
import { formatCurrency } from "@/utils/numberToWords";

const modeLabels: Record<string, string> = {
  neft: "NEFT", rtgs: "RTGS", cheque: "Cheque", cash: "Cash", upi: "UPI",
};

const Payments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const all: Payment[] = useMemo(() => getPayments(), [refresh]);
  const filtered = all.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.paymentRef.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q);
  });

  const stats = {
    collected: all.reduce((s, p) => s + p.amountReceived, 0),
    pending: all.reduce((s, p) => s + p.pendingAmount, 0),
    partial: all.filter(p => p.workflowStatus === "partial").length,
    completed: all.filter(p => p.workflowStatus === "paid").length,
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePayment(deleteId);
      toast({ title: "Payment deleted" });
      setDeleteId(null);
      setRefresh(r => r + 1);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground text-sm">Receipts collected against tax invoices</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Collected", value: formatCurrency(stats.collected) },
            { label: "Total Pending", value: formatCurrency(stats.pending) },
            { label: "Partial Receipts", value: stats.partial },
            { label: "Completed", value: stats.completed },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search by ref, customer or invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No payments recorded yet</p>
                <p className="text-sm">Click "Record Payment" on a Tax Invoice to add one</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Inv. Amt</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.paymentRef}</TableCell>
                      <TableCell>{new Date(p.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{p.customerName}</TableCell>
                      <TableCell className="text-xs">{p.invoiceNumber}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.invoiceAmount)}</TableCell>
                      <TableCell className="text-right text-green-700 font-medium">{formatCurrency(p.amountReceived)}</TableCell>
                      <TableCell className="text-right text-amber-700">{formatCurrency(p.pendingAmount)}</TableCell>
                      <TableCell>{modeLabels[p.paymentMode]}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={p.workflowStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                          {p.workflowStatus === "paid" ? "Paid" : "Partial"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/payments/edit/${p.id}`)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Payments;
