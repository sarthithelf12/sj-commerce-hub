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
import { Search, Plus, Pencil, Trash2, Package, AlertTriangle, TrendingUp } from "lucide-react";
import {
  getProducts, getProductsWithStock, saveProduct, deleteProduct, type Product,
} from "@/utils/productStorage";

const UNITS = ["Pcs", "Kg", "Ltr", "Mtr", "Box", "Set", "Nos", "Pair", "Roll", "Bag"];
const CATEGORIES = ["Raw Material", "Finished Goods", "Packaging", "Consumables", "Spare Parts", "Other"];

const emptyForm = {
  name: "", hsnCode: "", unit: "Nos", category: "Finished Goods", defaultTaxRate: 18,
  purchasePrice: 0, sellingPrice: 0, minStockLevel: 5, description: "",
};

const Inventory = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState(emptyForm);
  const [refreshKey, setRefreshKey] = useState(0);

  const productsWithStock = useMemo(() => getProductsWithStock(), [refreshKey]);

  const filtered = useMemo(() => {
    if (!search) return productsWithStock;
    const q = search.toLowerCase();
    return productsWithStock.filter(i =>
      i.name.toLowerCase().includes(q) || i.hsnCode.includes(q) ||
      i.category.toLowerCase().includes(q) || i.productCode.toLowerCase().includes(q)
    );
  }, [productsWithStock, search]);

  const stats = useMemo(() => ({
    total: productsWithStock.length,
    lowStock: productsWithStock.filter(p => p.currentStock <= p.minStockLevel && p.currentStock >= 0).length,
    totalValue: productsWithStock.reduce((s, p) => s + p.currentStock * p.sellingPrice, 0),
  }), [productsWithStock]);

  const handleSubmit = () => {
    if (!form.name.trim()) { toast({ title: "Product name is required", variant: "destructive" }); return; }
    saveProduct(form, editingId);
    toast({ title: editingId ? "Product updated" : "Product added" });
    setForm(emptyForm); setEditingId(undefined); setDialogOpen(false); setRefreshKey(k => k + 1);
  };

  const handleEdit = (item: Product) => {
    setForm({
      name: item.name, hsnCode: item.hsnCode, unit: item.unit, category: item.category,
      defaultTaxRate: item.defaultTaxRate, purchasePrice: item.purchasePrice, sellingPrice: item.sellingPrice,
      minStockLevel: item.minStockLevel, description: item.description,
    });
    setEditingId(item.id); setDialogOpen(true);
  };

  const openNew = () => { setForm(emptyForm); setEditingId(undefined); setDialogOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Product Master & Inventory</h1>
            <p className="text-muted-foreground">Stock = Total Purchased (POs) − Total Delivered (DCs)</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3"><Package className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Products</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
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
          <Input placeholder="Search by name, HSN code, product code, or category..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {productsWithStock.length === 0 ? "No products added yet. Click \"Add Product\" to get started." : "No results found."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Purchase ₹</TableHead>
                    <TableHead className="text-right">Selling ₹</TableHead>
                    <TableHead className="text-right">Purchased</TableHead>
                    <TableHead className="text-right">Delivered</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs text-primary">{item.productCode}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.name}
                        <br /><span className="text-xs text-muted-foreground">Tax: {item.defaultTaxRate}%</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.hsnCode || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell className="text-right">₹{item.purchasePrice.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{item.sellingPrice.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.purchased}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.delivered}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.currentStock <= item.minStockLevel ? "text-destructive font-bold" : "text-foreground font-semibold"}>
                          {item.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteProduct(item.id); toast({ title: "Product deleted" }); setRefreshKey(k => k + 1); }}>
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

        {/* Add/Edit Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Product Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
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
              <div><Label>Min Stock Level</Label><Input type="number" value={form.minStockLevel} onChange={e => setForm(f => ({ ...f, minStockLevel: Number(e.target.value) }))} /></div>
              <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Save"} Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Inventory;
