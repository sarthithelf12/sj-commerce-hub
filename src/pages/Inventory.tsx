import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Pencil, Trash2, Package, AlertTriangle, TrendingUp, Archive } from "lucide-react";
import {
  getInventoryItems, saveInventoryItem, deleteInventoryItem,
  addStockMovement, getLowStockItems, type InventoryItem,
} from "@/utils/inventoryStorage";

const UNITS = ["Pcs", "Kg", "Ltr", "Mtr", "Box", "Set", "Nos", "Pair", "Roll", "Bag"];
const CATEGORIES = ["Raw Material", "Finished Goods", "Packaging", "Consumables", "Spare Parts", "Other"];

const emptyForm = {
  name: "", hsnCode: "", unit: "Pcs", category: "Finished Goods", defaultTaxRate: 18,
  purchasePrice: 0, sellingPrice: 0, currentStock: 0, minStockLevel: 10, description: "",
};

const Inventory = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState(emptyForm);
  const [stockForm, setStockForm] = useState({ itemId: "", type: "in" as "in" | "out", quantity: 0, reference: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  const items = useMemo(() => getInventoryItems(), [refreshKey]);
  const lowStock = useMemo(() => getLowStockItems(), [refreshKey]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || i.hsnCode.includes(q) || i.category.toLowerCase().includes(q));
  }, [items, search]);

  const stats = useMemo(() => ({
    total: items.length,
    lowStock: lowStock.length,
    totalValue: items.reduce((s, i) => s + i.currentStock * i.sellingPrice, 0),
  }), [items, lowStock]);

  const handleSubmit = () => {
    if (!form.name.trim()) { toast({ title: "Item name is required", variant: "destructive" }); return; }
    saveInventoryItem(form, editingId);
    toast({ title: editingId ? "Item updated" : "Item added" });
    setForm(emptyForm); setEditingId(undefined); setDialogOpen(false); setRefreshKey(k => k + 1);
  };

  const handleEdit = (item: InventoryItem) => {
    setForm({
      name: item.name, hsnCode: item.hsnCode, unit: item.unit, category: item.category,
      defaultTaxRate: item.defaultTaxRate, purchasePrice: item.purchasePrice, sellingPrice: item.sellingPrice,
      currentStock: item.currentStock, minStockLevel: item.minStockLevel, description: item.description,
    });
    setEditingId(item.id); setDialogOpen(true);
  };

  const handleStockAdjust = () => {
    if (stockForm.quantity <= 0) { toast({ title: "Enter valid quantity", variant: "destructive" }); return; }
    addStockMovement(stockForm.itemId, stockForm.type, stockForm.quantity, stockForm.reference);
    toast({ title: `Stock ${stockForm.type === "in" ? "added" : "removed"}` });
    setStockDialogOpen(false); setRefreshKey(k => k + 1);
  };

  const openNew = () => { setForm(emptyForm); setEditingId(undefined); setDialogOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Manage your stock and inventory</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3"><Package className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-destructive/10 p-3"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-sm text-muted-foreground">Low Stock Alerts</p><p className="text-2xl font-bold text-foreground">{stats.lowStock}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-accent/10 p-3"><TrendingUp className="h-5 w-5 text-accent" /></div>
            <div><p className="text-sm text-muted-foreground">Stock Value</p><p className="text-2xl font-bold text-foreground">₹{stats.totalValue.toLocaleString("en-IN")}</p></div>
          </CardContent></Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, HSN code, or category..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <p className="font-medium text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Low Stock Alert</p>
              <p className="text-sm text-muted-foreground mt-1">
                {lowStock.map(i => i.name).join(", ")} — stock below minimum level
              </p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {items.length === 0 ? "No items added yet. Click \"Add Item\" to get started." : "No results found."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Purchase ₹</TableHead>
                    <TableHead className="text-right">Selling ₹</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.name}<br /><span className="text-xs text-muted-foreground">Tax: {item.defaultTaxRate}%</span></TableCell>
                      <TableCell className="font-mono text-xs">{item.hsnCode || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell className="text-right">₹{item.purchasePrice.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{item.sellingPrice.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.currentStock <= item.minStockLevel ? "text-destructive font-bold" : "text-foreground"}>
                          {item.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => { setStockForm({ itemId: item.id, type: "in", quantity: 0, reference: "" }); setStockDialogOpen(true); }}>
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteInventoryItem(item.id); toast({ title: "Item deleted" }); setRefreshKey(k => k + 1); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Item Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit Item" : "Add New Item"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Item Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>HSN Code</Label><Input value={form.hsnCode} onChange={e => setForm(f => ({ ...f, hsnCode: e.target.value }))} /></div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Default Tax Rate (%)</Label><Input type="number" value={form.defaultTaxRate} onChange={e => setForm(f => ({ ...f, defaultTaxRate: Number(e.target.value) }))} /></div>
              <div><Label>Purchase Price (₹)</Label><Input type="number" value={form.purchasePrice || ""} onChange={e => setForm(f => ({ ...f, purchasePrice: Number(e.target.value) }))} /></div>
              <div><Label>Selling Price (₹)</Label><Input type="number" value={form.sellingPrice || ""} onChange={e => setForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))} /></div>
              <div><Label>Opening Stock</Label><Input type="number" value={form.currentStock || ""} onChange={e => setForm(f => ({ ...f, currentStock: Number(e.target.value) }))} /></div>
              <div><Label>Min Stock Level</Label><Input type="number" value={form.minStockLevel} onChange={e => setForm(f => ({ ...f, minStockLevel: Number(e.target.value) }))} /></div>
              <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Save"} Item</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stock Adjustment Dialog */}
        <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Stock Adjustment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={stockForm.type} onValueChange={(v: "in" | "out") => setStockForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Quantity</Label><Input type="number" value={stockForm.quantity || ""} onChange={e => setStockForm(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
              <div><Label>Reference (PO/Invoice No.)</Label><Input value={stockForm.reference} onChange={e => setStockForm(f => ({ ...f, reference: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStockDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleStockAdjust}>Adjust Stock</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Inventory;
