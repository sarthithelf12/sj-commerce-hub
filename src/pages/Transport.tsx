import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Truck, Plus, Pencil, Trash2, Search, Package, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/numberToWords";
import { getDocuments } from "@/utils/documentStorage";

// ── Local storage for transport entries ─────────────────────
const TRANSPORT_KEY = "sjmart_transport";

export type TransportStatus = "pending" | "in-transit" | "delivered" | "cancelled";
export type TransportType = "outward" | "inward" | "return";

export interface TransportEntry {
  id: string;
  date: string;
  type: TransportType;
  linkedDoc: string;       // DC No / PO No
  linkedDocId: string;
  transporterName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  ewayBillNo: string;
  fromAddress: string;
  toAddress: string;
  weight: string;
  freightAmount: number;
  status: TransportStatus;
  notes: string;
  createdAt: string;
}

function getAll(): TransportEntry[] {
  try {
    const raw = localStorage.getItem(TRANSPORT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function setAll(items: TransportEntry[]) {
  localStorage.setItem(TRANSPORT_KEY, JSON.stringify(items));
}
function saveEntry(data: Omit<TransportEntry, "id" | "createdAt">, existingId?: string): TransportEntry {
  const all = getAll();
  const now = new Date().toISOString();
  if (existingId) {
    const idx = all.findIndex(e => e.id === existingId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data };
      setAll(all);
      return all[idx];
    }
  }
  const entry: TransportEntry = { ...data, id: crypto.randomUUID(), createdAt: now };
  all.unshift(entry);
  setAll(all);
  return entry;
}
function deleteEntry(id: string) {
  setAll(getAll().filter(e => e.id !== id));
}

const STATUS_CONFIG: Record<TransportStatus, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-yellow-100 text-yellow-800" },
  "in-transit": { label: "In Transit", cls: "bg-blue-100 text-blue-800" },
  delivered:  { label: "Delivered",  cls: "bg-green-100 text-green-800" },
  cancelled:  { label: "Cancelled",  cls: "bg-gray-100 text-gray-700" },
};

const TYPE_CONFIG: Record<TransportType, string> = {
  outward: "Outward (Customer)",
  inward:  "Inward (Supplier)",
  return:  "Return",
};

const empty = (): Omit<TransportEntry, "id" | "createdAt"> => ({
  date: new Date().toISOString().split("T")[0],
  type: "outward",
  linkedDoc: "",
  linkedDocId: "",
  transporterName: "",
  vehicleNo: "",
  driverName: "",
  driverPhone: "",
  ewayBillNo: "",
  fromAddress: "Unit 1, Plot 63, Block L, Darya Ganj, Delhi - 110002",
  toAddress: "",
  weight: "",
  freightAmount: 0,
  status: "pending",
  notes: "",
});

const Transport = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [refresh, setRefresh] = useState(0);

  const entries = useMemo(() => getAll(), [refresh]);
  const deliveryChallans = useMemo(() => getDocuments("delivery-challan"), []);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterStatus !== "all") list = list.filter(e => e.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.linkedDoc.toLowerCase().includes(q) ||
        e.transporterName.toLowerCase().includes(q) ||
        e.vehicleNo.toLowerCase().includes(q) ||
        e.driverName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, search, filterStatus, refresh]);

  const stats = {
    total: entries.length,
    inTransit: entries.filter(e => e.status === "in-transit").length,
    delivered: entries.filter(e => e.status === "delivered").length,
    totalFreight: entries.reduce((s, e) => s + (e.freightAmount || 0), 0),
  };

  const set = (field: keyof typeof form, val: string | number) =>
    setForm(f => ({ ...f, [field]: val }));

  const openNew = () => {
    setEditingId(undefined);
    setForm(empty());
    setDialogOpen(true);
  };

  const openEdit = (entry: TransportEntry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date, type: entry.type, linkedDoc: entry.linkedDoc,
      linkedDocId: entry.linkedDocId, transporterName: entry.transporterName,
      vehicleNo: entry.vehicleNo, driverName: entry.driverName,
      driverPhone: entry.driverPhone, ewayBillNo: entry.ewayBillNo,
      fromAddress: entry.fromAddress, toAddress: entry.toAddress,
      weight: entry.weight, freightAmount: entry.freightAmount,
      status: entry.status, notes: entry.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.transporterName.trim()) {
      toast({ title: "Transporter name required", variant: "destructive" });
      return;
    }
    saveEntry(form, editingId);
    toast({ title: editingId ? "Transport entry updated" : "Transport entry added" });
    setDialogOpen(false);
    setRefresh(r => r + 1);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteEntry(deleteId);
      toast({ title: "Entry deleted" });
      setDeleteId(null);
      setRefresh(r => r + 1);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Truck className="text-primary" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Transport & Logistics</h1>
              <p className="text-muted-foreground text-sm">Track shipments, vehicles, and freight costs</p>
            </div>
          </div>
          <Button onClick={openNew}>
            <Plus size={16} className="mr-2" /> Add Transport Entry
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Shipments", value: stats.total, color: "text-primary" },
            { label: "In Transit", value: stats.inTransit, color: "text-blue-600" },
            { label: "Delivered", value: stats.delivered, color: "text-green-600" },
            { label: "Total Freight Cost", value: formatCurrency(stats.totalFreight), color: "text-orange-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Truck className={s.color} size={22} />
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by transporter, vehicle, DC no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {(Object.keys(STATUS_CONFIG) as TransportStatus[]).map(s => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No transport entries yet</p>
                <p className="text-sm">Add shipment details linked to your Delivery Challans</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Linked Doc</TableHead>
                    <TableHead>Transporter</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>E-Way Bill</TableHead>
                    <TableHead className="text-right">Freight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-xs">{TYPE_CONFIG[entry.type]}</TableCell>
                      <TableCell className="font-medium text-xs">{entry.linkedDoc || "—"}</TableCell>
                      <TableCell>{entry.transporterName}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.vehicleNo || "—"}</TableCell>
                      <TableCell>
                        <div>{entry.driverName || "—"}</div>
                        {entry.driverPhone && (
                          <div className="text-xs text-muted-foreground">{entry.driverPhone}</div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{entry.ewayBillNo || "—"}</TableCell>
                      <TableCell className="text-right">{entry.freightAmount > 0 ? formatCurrency(entry.freightAmount) : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_CONFIG[entry.status].cls}>
                          {STATUS_CONFIG[entry.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(entry.id)}>
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Transport Entry" : "New Transport Entry"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(TYPE_CONFIG) as [TransportType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Linked DC / PO Number</Label>
              <Select
                value={form.linkedDoc}
                onValueChange={v => {
                  const dc = deliveryChallans.find(d => d.docNumber === v);
                  set("linkedDoc", v);
                  set("linkedDocId", dc?.id || "");
                  if (dc) {
                    const data = dc.data as Record<string, unknown>;
                    set("toAddress", (data.customerAddress as string) || "");
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select or type manually" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— None —</SelectItem>
                  {deliveryChallans.map(dc => (
                    <SelectItem key={dc.id} value={dc.docNumber}>{dc.docNumber} — {dc.partyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_CONFIG) as [TransportStatus, { label: string; cls: string }][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Transporter Name *</Label>
              <Input value={form.transporterName} onChange={e => set("transporterName", e.target.value)} placeholder="e.g. Porter, Delhivery" />
            </div>
            <div className="space-y-1">
              <Label>Vehicle Number</Label>
              <Input value={form.vehicleNo} onChange={e => set("vehicleNo", e.target.value)} placeholder="e.g. DL01AB1234" />
            </div>
            <div className="space-y-1">
              <Label>Driver Name</Label>
              <Input value={form.driverName} onChange={e => set("driverName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Driver Phone</Label>
              <Input value={form.driverPhone} onChange={e => set("driverPhone", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>E-Way Bill No</Label>
              <Input value={form.ewayBillNo} onChange={e => set("ewayBillNo", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Weight / Packages</Label>
              <Input value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="e.g. 50 kg / 3 boxes" />
            </div>
            <div className="space-y-1">
              <Label>Freight Amount (₹)</Label>
              <Input type="number" value={form.freightAmount} onChange={e => set("freightAmount", Number(e.target.value))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>From Address</Label>
              <Input value={form.fromAddress} onChange={e => set("fromAddress", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>To Address</Label>
              <Textarea value={form.toAddress} onChange={e => set("toAddress", e.target.value)} rows={2} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transport Entry?</AlertDialogTitle>
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

export default Transport;
