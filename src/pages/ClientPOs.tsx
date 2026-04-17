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
import { Plus, Search, Pencil, Trash2, ClipboardCheck, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getClientPOs, deleteClientPO, type ClientPO } from "@/utils/clientPoStorage";
import { formatCurrency } from "@/utils/numberToWords";

const statusStyles: Record<string, string> = {
  "po-received": "bg-blue-100 text-blue-800",
  ordered: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  invoiced: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, string> = {
  "po-received": "PO Received",
  ordered: "Supplier PO Raised",
  delivered: "Delivered",
  invoiced: "Invoiced",
  paid: "Paid",
  cancelled: "Cancelled",
};

const ClientPOs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const all = useMemo(() => getClientPOs(), [refresh]);
  const filtered = all.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.internalRef.toLowerCase().includes(q) ||
      c.clientPoNumber.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.quotationNumber.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: all.length,
    active: all.filter(c => c.workflowStatus === "po-received").length,
    raised: all.filter(c => c.workflowStatus === "ordered").length,
    completed: all.filter(c => c.workflowStatus === "delivered" || c.workflowStatus === "invoiced" || c.workflowStatus === "paid").length,
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteClientPO(deleteId);
      toast({ title: "Client PO deleted" });
      setDeleteId(null);
      setRefresh(r => r + 1);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Purchase Orders</h1>
            <p className="text-muted-foreground text-sm">Customer POs received against quotations</p>
          </div>
          <Button onClick={() => navigate("/client-po/new")}>
            <Plus size={16} className="mr-2" /> New Client PO
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total },
            { label: "Active (PO Received)", value: stats.active },
            { label: "Supplier PO Raised", value: stats.raised },
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
            placeholder="Search by Internal Ref, Client PO No, Customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No Client POs yet</p>
                <p className="text-sm">Mark a quotation as "Client PO Received" to create one</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Internal Ref</TableHead>
                    <TableHead>Client PO No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Quotation</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(cpo => (
                    <TableRow key={cpo.id}>
                      <TableCell className="font-medium">{cpo.internalRef}</TableCell>
                      <TableCell>{cpo.clientPoNumber || "—"}</TableCell>
                      <TableCell>{new Date(cpo.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{cpo.customerName}</TableCell>
                      <TableCell className="text-xs">{cpo.quotationNumber || "—"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cpo.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[cpo.workflowStatus] || ""}>
                          {statusLabels[cpo.workflowStatus] || cpo.workflowStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/client-po/edit/${cpo.id}`)}>
                          <Pencil size={14} />
                        </Button>
                        {cpo.workflowStatus === "po-received" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => navigate(`/purchases/new/from-client-po/${cpo.id}`)}
                          >
                            <ShoppingCart size={12} />
                            Supplier PO
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(cpo.id)}>
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
            <AlertDialogTitle>Delete Client PO?</AlertDialogTitle>
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

export default ClientPOs;
