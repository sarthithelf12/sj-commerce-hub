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
import { Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPayment, savePayment, getPaymentsForInvoice, getTotalReceivedForInvoice,
  type PaymentMode,
} from "@/utils/paymentStorage";
import { getDocument, updateDocumentWorkflowStatus } from "@/utils/documentStorage";
import { saveLink } from "@/utils/workflowStorage";
import { formatCurrency } from "@/utils/numberToWords";
import { WorkflowTrail } from "@/components/shared/WorkflowTrail";

const PaymentNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, invoiceId: srcInvoiceId } = useParams();
  const isEdit = !!id;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("neft");
  const [bankRef, setBankRef] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceBanner, setSourceBanner] = useState<string | null>(null);

  // Load existing edit
  useEffect(() => {
    if (!isEdit || !id) return;
    const p = getPayment(id);
    if (!p) return;
    setDate(p.date);
    setCustomerId(p.customerId);
    setCustomerName(p.customerName);
    setInvoiceId(p.invoiceId);
    setInvoiceNumber(p.invoiceNumber);
    setInvoiceAmount(p.invoiceAmount);
    setAmountReceived(p.amountReceived);
    setPaymentMode(p.paymentMode);
    setBankRef(p.bankRef);
    setNotes(p.notes);
  }, [id, isEdit]);

  // Pre-fill from invoice
  useEffect(() => {
    if (!srcInvoiceId || isEdit) return;
    const doc = getDocument(srcInvoiceId);
    if (!doc) return;
    setInvoiceId(doc.id);
    setInvoiceNumber(doc.docNumber);
    setInvoiceAmount(doc.amount);
    setCustomerName(doc.partyName);
    const alreadyReceived = getTotalReceivedForInvoice(doc.id);
    const pending = Math.max(0, doc.amount - alreadyReceived);
    setAmountReceived(pending);
    setSourceBanner(`Recording payment for Invoice ${doc.docNumber}. Outstanding: ${formatCurrency(pending)}`);
  }, [srcInvoiceId, isEdit]);

  const existingPayments = useMemo(() => invoiceId ? getPaymentsForInvoice(invoiceId).filter(p => p.id !== id) : [], [invoiceId, id]);
  const previouslyReceived = existingPayments.reduce((s, p) => s + p.amountReceived, 0);
  const pendingAmount = Math.max(0, invoiceAmount - previouslyReceived - amountReceived);

  const handleSave = () => {
    if (!invoiceId) {
      toast({ title: "Invoice is required", variant: "destructive" });
      return;
    }
    if (amountReceived <= 0) {
      toast({ title: "Amount must be greater than zero", variant: "destructive" });
      return;
    }
    const totalCollected = previouslyReceived + amountReceived;
    const status: "paid" | "partial" = totalCollected >= invoiceAmount ? "paid" : "partial";

    const saved = savePayment({
      date,
      customerId,
      customerName,
      invoiceId,
      invoiceNumber,
      invoiceAmount,
      amountReceived,
      paymentMode,
      bankRef,
      pendingAmount,
      workflowStatus: status,
      notes,
    }, isEdit ? id : undefined);

    updateDocumentWorkflowStatus(invoiceId, status);
    saveLink({
      stage: "payment",
      documentId: saved.id,
      documentNumber: saved.paymentRef,
      parentStage: "tax-invoice",
      parentId: invoiceId,
      parentNumber: invoiceNumber,
      customerId,
      customerName,
    });

    toast({ title: isEdit ? "Payment updated" : "Payment recorded" });
    navigate("/payments");
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Edit Payment" : "Record Payment"}
        </h1>

        {sourceBanner && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <Info size={14} /> {sourceBanner}
          </div>
        )}

        {existingPayments.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Previous Payments for this Invoice</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {existingPayments.map(p => (
                  <div key={p.id} className="flex justify-between border-b pb-1">
                    <span>{p.paymentRef} • {new Date(p.date).toLocaleDateString("en-IN")} • {p.paymentMode.toUpperCase()}</span>
                    <span className="font-medium">{formatCurrency(p.amountReceived)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-semibold">
                  <span>Total Received So Far</span>
                  <span className="text-green-700">{formatCurrency(previouslyReceived)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Payment Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Customer</Label>
              <Input value={customerName} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Invoice No</Label>
              <Input value={invoiceNumber} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Invoice Amount</Label>
              <Input value={formatCurrency(invoiceAmount)} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Amount Received *</Label>
              <Input type="number" min={0} step="0.01" value={amountReceived} onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground mt-1">Pending after this payment: <strong>{formatCurrency(pendingAmount)}</strong></p>
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="neft">NEFT</SelectItem>
                  <SelectItem value="rtgs">RTGS</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Bank Reference / UTR / Cheque No</Label>
              <Input value={bankRef} onChange={e => setBankRef(e.target.value)} placeholder="e.g., UTR12345" />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {isEdit && id && (
          <Card>
            <CardHeader><CardTitle className="text-base">Transaction Trail</CardTitle></CardHeader>
            <CardContent>
              <WorkflowTrail documentId={id} currentStage="payment" />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/payments")}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? "Update" : "Save Payment"}</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentNew;
