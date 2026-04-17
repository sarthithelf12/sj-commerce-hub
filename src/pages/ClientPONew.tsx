import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getParties } from "@/utils/partyStorage";
import { getDocument, updateDocumentWorkflowStatus, getDocuments, type StoredDocument } from "@/utils/documentStorage";
import {
  getClientPO, saveClientPO, type ClientPOItem,
} from "@/utils/clientPoStorage";
import { saveLink } from "@/utils/workflowStorage";
import { ProductSelect } from "@/components/shared/ProductSelect";
import { type Product } from "@/utils/productStorage";
import { WorkflowTrail } from "@/components/shared/WorkflowTrail";
import { formatCurrency } from "@/utils/numberToWords";

const emptyItem = (): ClientPOItem => ({
  id: crypto.randomUUID(),
  productId: "",
  product: "",
  hsn: "",
  quantity: 1,
  unitPrice: 0,
  gstRate: 18,
});

const ClientPONew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, quotationId: srcQuotationId } = useParams();
  const isEdit = !!id;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [clientPoNumber, setClientPoNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [items, setItems] = useState<ClientPOItem[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [sourceBanner, setSourceBanner] = useState<string | null>(null);

  const customers = getParties("customer");
  const allQuotations: StoredDocument[] = useMemo(() => getDocuments("quotation"), []);

  // Load existing edit
  useEffect(() => {
    if (!isEdit || !id) return;
    const cpo = getClientPO(id);
    if (!cpo) return;
    setDate(cpo.date);
    setClientPoNumber(cpo.clientPoNumber);
    setCustomerId(cpo.customerId);
    setCustomerName(cpo.customerName);
    setCustomerGstin(cpo.customerGstin);
    setQuotationId(cpo.quotationId);
    setQuotationNumber(cpo.quotationNumber);
    setItems(cpo.items.length ? cpo.items : [emptyItem()]);
    setNotes(cpo.notes);
  }, [id, isEdit]);

  // Pre-fill from quotation
  useEffect(() => {
    if (!srcQuotationId || isEdit) return;
    const doc = getDocument(srcQuotationId);
    if (!doc) return;
    const data = doc.data as Record<string, unknown>;
    setQuotationId(doc.id);
    setQuotationNumber(doc.docNumber);
    setCustomerName(doc.partyName || (data.customerName as string) || "");
    const party = customers.find(p => p.name === doc.partyName);
    if (party) {
      setCustomerId(party.id);
      setCustomerGstin(party.gstin);
    }
    const srcItems = (data.items as Array<Record<string, unknown>>) || [];
    if (srcItems.length) {
      setItems(srcItems.map(it => ({
        id: crypto.randomUUID(),
        productId: (it.productId as string) || "",
        product: (it.product as string) || "",
        hsn: (it.hsn as string) || "",
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        gstRate: Number(it.gstRate) || 18,
      })));
    }
    setSourceBanner(`Pre-filled from Quotation ${doc.docNumber}. Review and confirm before saving.`);
  }, [srcQuotationId, isEdit]);

  const totalAmount = useMemo(() => items.reduce((sum, it) => {
    const base = it.quantity * it.unitPrice;
    return sum + base + (base * it.gstRate) / 100;
  }, 0), [items]);

  const updateItem = (idx: number, field: keyof ClientPOItem, value: string | number) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleCustomerChange = (val: string) => {
    setCustomerId(val);
    const p = customers.find(c => c.id === val);
    if (p) {
      setCustomerName(p.name);
      setCustomerGstin(p.gstin);
    }
  };

  const handleSave = () => {
    if (!customerName.trim()) {
      toast({ title: "Customer is required", variant: "destructive" });
      return;
    }
    if (!clientPoNumber.trim()) {
      toast({ title: "Client PO number is required", variant: "destructive" });
      return;
    }

    const saved = saveClientPO({
      clientPoNumber,
      date,
      customerId,
      customerName,
      customerGstin,
      quotationId,
      quotationNumber,
      items,
      totalAmount,
      notes,
      workflowStatus: "po-received",
      supplierPoIds: [],
    }, isEdit ? id : undefined);

    // Update quotation status & save workflow link
    if (quotationId) {
      updateDocumentWorkflowStatus(quotationId, "po-received");
      saveLink({
        stage: "client-po",
        documentId: saved.id,
        documentNumber: saved.internalRef,
        parentStage: "quotation",
        parentId: quotationId,
        parentNumber: quotationNumber,
        customerId,
        customerName,
      });
    } else {
      saveLink({
        stage: "client-po",
        documentId: saved.id,
        documentNumber: saved.internalRef,
        customerId,
        customerName,
      });
    }

    toast({ title: isEdit ? "Client PO updated" : "Client PO created" });
    navigate("/client-po");
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Edit Client PO" : "New Client PO"}
        </h1>

        {sourceBanner && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <Info size={14} /> {sourceBanner}
          </div>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Client PO Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Client PO Number *</Label>
              <Input value={clientPoNumber} onChange={e => setClientPoNumber(e.target.value)} placeholder="Customer's PO no." />
            </div>
            <div>
              <Label>PO Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger><SelectValue placeholder="Choose customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Linked Quotation</Label>
              {quotationId ? (
                <Input value={quotationNumber} disabled className="bg-muted" />
              ) : (
                <Select value={quotationId} onValueChange={(val) => {
                  setQuotationId(val);
                  const q = allQuotations.find(d => d.id === val);
                  if (q) setQuotationNumber(q.docNumber);
                }}>
                  <SelectTrigger><SelectValue placeholder="Choose quotation (optional)" /></SelectTrigger>
                  <SelectContent>
                    {allQuotations.map(q => <SelectItem key={q.id} value={q.id}>{q.docNumber} — {q.partyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setItems([...items, emptyItem()])}>
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Product</TableHead>
                  <TableHead className="w-24">HSN</TableHead>
                  <TableHead className="w-20 text-right">Qty</TableHead>
                  <TableHead className="w-28 text-right">Unit Price</TableHead>
                  <TableHead className="w-20">GST %</TableHead>
                  <TableHead className="w-28 text-right">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it, idx) => {
                  const base = it.quantity * it.unitPrice;
                  const total = base + (base * it.gstRate) / 100;
                  return (
                    <TableRow key={it.id}>
                      <TableCell>
                        <ProductSelect
                          value={it.productId}
                          onValueChange={(pid) => updateItem(idx, "productId", pid)}
                          onProductSelect={(p: Product) => {
                            setItems(prev => prev.map((row, i) => i === idx ? { ...row, productId: p.id, product: p.name, hsn: p.hsnCode, unitPrice: p.sellingPrice, gstRate: p.defaultTaxRate } : row));
                          }}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell><Input value={it.hsn} onChange={e => updateItem(idx, "hsn", e.target.value)} className="h-8" /></TableCell>
                      <TableCell><Input type="number" min={1} value={it.quantity} onChange={e => updateItem(idx, "quantity", parseInt(e.target.value) || 1)} className="h-8 text-right" /></TableCell>
                      <TableCell><Input type="number" min={0} value={it.unitPrice} onChange={e => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} className="h-8 text-right" /></TableCell>
                      <TableCell><Input type="number" min={0} value={it.gstRate} onChange={e => updateItem(idx, "gstRate", parseFloat(e.target.value) || 0)} className="h-8" /></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={items.length === 1} onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 text-base font-semibold">
              Total: {formatCurrency(totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Internal notes..." />
          </CardContent>
        </Card>

        {isEdit && id && (
          <Card>
            <CardHeader><CardTitle className="text-base">Transaction Trail</CardTitle></CardHeader>
            <CardContent>
              <WorkflowTrail documentId={id} currentStage="client-po" />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/client-po")}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? "Update" : "Save"}</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientPONew;
