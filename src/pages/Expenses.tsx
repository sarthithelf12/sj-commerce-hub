import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Pencil, Trash2, Wallet, TrendingDown, Calendar } from "lucide-react";
import {
  getExpenses, saveExpense, deleteExpense, getExpenseSummaryByCategory,
  EXPENSE_CATEGORIES, type Expense, type ExpenseCategory,
} from "@/utils/expenseStorage";

const emptyForm = {
  date: new Date().toISOString().split("T")[0], category: "other" as ExpenseCategory,
  description: "", amount: 0, paidTo: "", paymentMode: "bank" as const, reference: "", notes: "",
};

const Expenses = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState(emptyForm);
  const [refreshKey, setRefreshKey] = useState(0);

  const expenses = useMemo(() => getExpenses(), [refreshKey]);
  const categorySummary = useMemo(() => getExpenseSummaryByCategory(), [refreshKey]);

  const filtered = useMemo(() => {
    let list = expenses;
    if (filterCategory !== "all") list = list.filter(e => e.category === filterCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.description.toLowerCase().includes(q) || e.paidTo.toLowerCase().includes(q) || e.reference.toLowerCase().includes(q));
    }
    return list;
  }, [expenses, search, filterCategory]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const handleSubmit = () => {
    if (!form.description.trim() || form.amount <= 0) {
      toast({ title: "Description and amount are required", variant: "destructive" }); return;
    }
    saveExpense(form, editingId);
    toast({ title: editingId ? "Expense updated" : "Expense recorded" });
    setForm(emptyForm); setEditingId(undefined); setDialogOpen(false); setRefreshKey(k => k + 1);
  };

  const handleEdit = (expense: Expense) => {
    setForm({
      date: expense.date, category: expense.category, description: expense.description,
      amount: expense.amount, paidTo: expense.paidTo, paymentMode: expense.paymentMode,
      reference: expense.reference, notes: expense.notes,
    });
    setEditingId(expense.id); setDialogOpen(true);
  };

  const openNew = () => { setForm(emptyForm); setEditingId(undefined); setDialogOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Track all your business expenses</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-destructive/10 p-3"><TrendingDown className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-foreground">₹{totalExpenses.toLocaleString("en-IN")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-warning/10 p-3"><Calendar className="h-5 w-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-foreground">₹{thisMonthTotal.toLocaleString("en-IN")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3"><Wallet className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Categories</p><p className="text-2xl font-bold text-foreground">{categorySummary.length}</p></div>
          </CardContent></Card>
        </div>

        {/* Category Breakdown */}
        {categorySummary.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Expense Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categorySummary.map(c => (
                  <Badge key={c.category} variant="secondary" className="text-sm py-1 px-3">
                    {c.label}: ₹{c.total.toLocaleString("en-IN")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by description, vendor, or reference..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {expenses.length === 0 ? "No expenses recorded yet. Click \"Add Expense\" to get started." : "No results found."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid To</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((expense, i) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{expense.date}</TableCell>
                      <TableCell className="font-medium text-foreground">{expense.description}{expense.reference && <br />}{expense.reference && <span className="text-xs text-muted-foreground">Ref: {expense.reference}</span>}</TableCell>
                      <TableCell><Badge variant="outline">{EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label}</Badge></TableCell>
                      <TableCell>{expense.paidTo || "—"}</TableCell>
                      <TableCell className="capitalize">{expense.paymentMode}</TableCell>
                      <TableCell className="text-right font-medium">₹{expense.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteExpense(expense.id); toast({ title: "Expense deleted" }); setRefreshKey(k => k + 1); }}>
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

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? "Edit Expense" : "Record Expense"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v: ExpenseCategory) => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Label>Description *</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Office rent for March" /></div>
              <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
              <div><Label>Paid To</Label><Input value={form.paidTo} onChange={e => setForm(f => ({ ...f, paidTo: e.target.value }))} placeholder="Vendor/Person name" /></div>
              <div>
                <Label>Payment Mode</Label>
                <Select value={form.paymentMode} onValueChange={(v: "cash" | "bank" | "upi" | "cheque") => setForm(f => ({ ...f, paymentMode: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Reference No.</Label><Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Cheque/UTR number" /></div>
              <div className="md:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Save"} Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Expenses;
