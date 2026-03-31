import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Pencil, Trash2, Users, Building2, UserCheck } from "lucide-react";
import { getParties, saveParty, deleteParty, type Party, type PartyType } from "@/utils/partyStorage";

const emptyForm = {
  name: "", type: "customer" as PartyType, gstin: "", pan: "", phone: "", email: "",
  address: "", state: "", city: "", pincode: "", contactPerson: "", paymentTerms: "30 days",
  openingBalance: 0, balanceType: "receivable" as const,
};

const Parties = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState(emptyForm);
  const [refreshKey, setRefreshKey] = useState(0);

  const parties = useMemo(() => getParties(), [refreshKey]);

  const filtered = useMemo(() => {
    let list = parties;
    if (filterType !== "all") list = list.filter(p => p.type === filterType || p.type === "both");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.gstin.toLowerCase().includes(q) || p.phone.includes(q));
    }
    return list;
  }, [parties, search, filterType]);

  const stats = useMemo(() => ({
    total: parties.length,
    customers: parties.filter(p => p.type === "customer" || p.type === "both").length,
    suppliers: parties.filter(p => p.type === "supplier" || p.type === "both").length,
  }), [parties]);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    saveParty(form, editingId);
    toast({ title: editingId ? "Party updated" : "Party added" });
    setForm(emptyForm);
    setEditingId(undefined);
    setDialogOpen(false);
    setRefreshKey(k => k + 1);
  };

  const handleEdit = (party: Party) => {
    setForm({
      name: party.name, type: party.type, gstin: party.gstin, pan: party.pan,
      phone: party.phone, email: party.email, address: party.address, state: party.state,
      city: party.city, pincode: party.pincode, contactPerson: party.contactPerson,
      paymentTerms: party.paymentTerms, openingBalance: party.openingBalance, balanceType: party.balanceType,
    });
    setEditingId(party.id);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteParty(id);
    toast({ title: "Party deleted" });
    setRefreshKey(k => k + 1);
  };

  const openNew = () => { setForm(emptyForm); setEditingId(undefined); setDialogOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Parties</h1>
            <p className="text-muted-foreground">Manage customers and suppliers</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Party</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Parties</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-accent/10 p-3"><Building2 className="h-5 w-5 text-accent" /></div>
            <div><p className="text-sm text-muted-foreground">Customers</p><p className="text-2xl font-bold text-foreground">{stats.customers}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-warning/10 p-3"><UserCheck className="h-5 w-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">Suppliers</p><p className="text-2xl font-bold text-foreground">{stats.suppliers}</p></div>
          </CardContent></Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, GSTIN, or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="supplier">Suppliers</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {parties.length === 0 ? "No parties added yet. Click \"Add Party\" to get started." : "No results found."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((party, i) => (
                    <TableRow key={party.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{party.name}<br /><span className="text-xs text-muted-foreground">{party.contactPerson}</span></TableCell>
                      <TableCell>
                        <Badge variant={party.type === "customer" ? "default" : party.type === "supplier" ? "secondary" : "outline"}>
                          {party.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{party.gstin || "—"}</TableCell>
                      <TableCell>{party.phone || "—"}</TableCell>
                      <TableCell>{party.state || "—"}</TableCell>
                      <TableCell>
                        {party.openingBalance > 0 && (
                          <span className={party.balanceType === "receivable" ? "text-accent" : "text-destructive"}>
                            ₹{party.openingBalance.toLocaleString("en-IN")} {party.balanceType === "receivable" ? "Dr" : "Cr"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(party)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(party.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit Party" : "Add New Party"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Party Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. ABC Corporation" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v: PartyType) => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))} placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div>
                <Label>PAN</Label>
                <Input value={form.pan} onChange={e => setForm(f => ({ ...f, pan: e.target.value.toUpperCase() }))} placeholder="AAAAA0000A" maxLength={10} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@company.com" />
              </div>
              <div>
                <Label>Contact Person</Label>
                <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Delhi" />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} maxLength={6} />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Select value={form.paymentTerms} onValueChange={v => setForm(f => ({ ...f, paymentTerms: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="7 days">7 Days</SelectItem>
                    <SelectItem value="15 days">15 Days</SelectItem>
                    <SelectItem value="30 days">30 Days</SelectItem>
                    <SelectItem value="45 days">45 Days</SelectItem>
                    <SelectItem value="60 days">60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Opening Balance (₹)</Label>
                <Input type="number" value={form.openingBalance || ""} onChange={e => setForm(f => ({ ...f, openingBalance: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Balance Type</Label>
                <Select value={form.balanceType} onValueChange={(v: "receivable" | "payable") => setForm(f => ({ ...f, balanceType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">Receivable (Dr)</SelectItem>
                    <SelectItem value="payable">Payable (Cr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Save"} Party</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Parties;
