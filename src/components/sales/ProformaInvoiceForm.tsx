import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, FileText, Building2, Phone, Mail, MapPin, AlertCircle, Eye } from "lucide-react";
import { numberToWords, formatCurrency } from "@/utils/numberToWords";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { COMPANY_INFO } from "@/config/companyInfo";
import { PDFDownloadWrapper } from "@/components/shared/PDFDownloadWrapper";
import { ProformaInvoicePreview } from "@/components/sales/ProformaInvoicePreview";
import { saveDocument } from "@/utils/documentStorage";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProductSelect } from "@/components/shared/ProductSelect";
import { type Product } from "@/utils/productStorage";

interface LineItem {
  id: string;
  productId: string;
  product: string;
  hsn: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

const GST_RATES = [5, 12, 18, 28];

// COMPANY_INFO imported from config

export const ProformaInvoiceForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proformaNo, setProformaNo] = useState("PI/SJ/DL/25/0001");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quotationRef, setQuotationRef] = useState("");
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerPincode, setCustomerPincode] = useState("");
  
  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", product: "", hsn: "", specification: "", quantity: 1, unitPrice: 0, gstRate: 18 }
  ]);
  
  // Terms
  const [validity, setValidity] = useState("15 days");
  const [paymentTerms, setPaymentTerms] = useState("100% Advance Payment");
  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), product: "", hsn: "", specification: "", quantity: 1, unitPrice: 0, gstRate: 18 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const isInterState = useMemo(() => {
    return customerState !== "" && customerState !== COMPANY_INFO.state;
  }, [customerState]);

  const calculations = useMemo(() => {
    let totalBeforeTax = 0;
    let totalTax = 0;
    const gstBreakdown: Record<number, { cgst: number; sgst: number; igst: number; taxable: number }> = {
      5: { cgst: 0, sgst: 0, igst: 0, taxable: 0 },
      12: { cgst: 0, sgst: 0, igst: 0, taxable: 0 },
      18: { cgst: 0, sgst: 0, igst: 0, taxable: 0 },
      28: { cgst: 0, sgst: 0, igst: 0, taxable: 0 }
    };

    items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const taxAmount = (itemTotal * item.gstRate) / 100;
      
      totalBeforeTax += itemTotal;
      totalTax += taxAmount;
      
      if (gstBreakdown[item.gstRate]) {
        gstBreakdown[item.gstRate].taxable += itemTotal;
        if (isInterState) {
          gstBreakdown[item.gstRate].igst += taxAmount;
        } else {
          gstBreakdown[item.gstRate].cgst += taxAmount / 2;
          gstBreakdown[item.gstRate].sgst += taxAmount / 2;
        }
      }
    });

    return {
      totalBeforeTax,
      totalTax,
      grandTotal: totalBeforeTax + totalTax,
      gstBreakdown
    };
  }, [items, isInterState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDocument("proforma-invoice", proformaNo, date, customerName, calculations.grandTotal, {
      proformaNo, date, quotationRef, customerName, customerAddress, customerState,
      customerGstin, customerPincode, items, calculations, isInterState, validity, paymentTerms,
    });
    toast({ title: "Proforma Invoice saved", description: `${proformaNo} has been saved successfully.` });
    navigate("/sales/proforma");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a Proforma Invoice - a preliminary bill of sale sent to buyers before delivery. It is NOT a tax invoice.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* From - Company Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 size={18} />
              From
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-bold text-lg text-primary">{COMPANY_INFO.name}</p>
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {COMPANY_INFO.address}
            </p>
            <p className="text-muted-foreground">GSTIN: <span className="font-medium text-foreground">{COMPANY_INFO.gstin}</span></p>
            <p className="text-muted-foreground">PAN: <span className="font-medium text-foreground">{COMPANY_INFO.pan}</span></p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone size={14} />
              {COMPANY_INFO.phone}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} />
              {COMPANY_INFO.email}
            </p>
          </CardContent>
        </Card>

        {/* To - Customer Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Bill To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proformaNo" className="text-xs">Proforma No.</Label>
                <Input
                  id="proformaNo"
                  value={proformaNo}
                  onChange={(e) => setProformaNo(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quotationRef" className="text-xs">Quotation Reference (if any)</Label>
              <Input
                id="quotationRef"
                value={quotationRef}
                onChange={(e) => setQuotationRef(e.target.value)}
                placeholder="Enter quotation reference"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-xs">Customer / Organization Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerGstin" className="text-xs">Customer GSTIN</Label>
              <Input
                id="customerGstin"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
                placeholder="Enter GSTIN"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerAddress" className="text-xs">Address</Label>
              <Textarea
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter complete address"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="customerState" className="text-xs">State</Label>
                <Select value={customerState} onValueChange={setCustomerState}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode" className="text-xs">PIN Code</Label>
                <Input
                  id="pincode"
                  value={customerPincode}
                  onChange={(e) => setCustomerPincode(e.target.value)}
                  placeholder="Enter PIN"
                  className="h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus size={16} /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">S.No</TableHead>
                  <TableHead className="min-w-[180px]">Product</TableHead>
                  <TableHead className="w-24">HSN/SAC</TableHead>
                  <TableHead className="min-w-[150px]">Specification</TableHead>
                  <TableHead className="w-20 text-right">Qty</TableHead>
                  <TableHead className="w-28 text-right">Unit Price</TableHead>
                  <TableHead className="w-28 text-right">Before Tax</TableHead>
                  <TableHead className="w-24">GST Rate</TableHead>
                  <TableHead className="w-28 text-right">Tax Amt</TableHead>
                  <TableHead className="w-28 text-right">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const beforeTax = item.quantity * item.unitPrice;
                  const taxAmt = (beforeTax * item.gstRate) / 100;
                  const total = beforeTax + taxAmt;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={item.product}
                          onChange={(e) => updateItem(item.id, "product", e.target.value)}
                          placeholder="Product name"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.hsn}
                          onChange={(e) => updateItem(item.id, "hsn", e.target.value)}
                          placeholder="HSN"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.specification}
                          onChange={(e) => updateItem(item.id, "specification", e.target.value)}
                          placeholder="Specs"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                          className="h-8 text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="h-8 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(beforeTax)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.gstRate.toString()}
                          onValueChange={(v) => updateItem(item.id, "gstRate", parseInt(v))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map(rate => (
                              <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(taxAmt)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(total)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* GST Calculation & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">GST Calculation</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isInterState ? "Inter-State Supply (IGST)" : "Intra-State Supply (CGST + SGST)"}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rate</TableHead>
                  <TableHead className="text-right">CGST</TableHead>
                  <TableHead className="text-right">SGST</TableHead>
                  <TableHead className="text-right">IGST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {GST_RATES.map(rate => (
                  <TableRow key={rate}>
                    <TableCell className="font-medium">{rate}%</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calculations.gstBreakdown[rate].cgst)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calculations.gstBreakdown[rate].sgst)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calculations.gstBreakdown[rate].igst)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Price Before Tax</span>
              <span className="font-medium">{formatCurrency(calculations.totalBeforeTax)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Total Tax</span>
              <span className="font-medium">{formatCurrency(calculations.totalTax)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Total Price</span>
              <span className="font-medium">{formatCurrency(calculations.grandTotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold text-primary">
              <span>Grand Total</span>
              <span>{formatCurrency(calculations.grandTotal)}</span>
            </div>
            <div className="pt-2 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">Amount in Words:</p>
              <p className="text-sm font-medium">{numberToWords(calculations.grandTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms & Payment Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="validity" className="text-xs">Validity</Label>
                <Input
                  id="validity"
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                  placeholder="e.g., 15 days"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paymentTerms" className="text-xs">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., 100% Advance"
                  className="h-9"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p>• This is a Proforma Invoice - NOT a Tax Invoice</p>
              <p>• Prices are subject to change until order confirmation</p>
              <p>• Final Tax Invoice will be issued upon delivery</p>
              <p>• All disputes subject to Delhi jurisdiction</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Cheque to be drawn in the favor of <span className="font-medium text-foreground">{COMPANY_INFO.name}</span>
            </p>
            <div className="border rounded-md p-3 space-y-2 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Online Transfer Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">{COMPANY_INFO.bankName}</span>
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-medium">{COMPANY_INFO.accountName}</span>
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-medium">{COMPANY_INFO.accountNumber}</span>
                <span className="text-muted-foreground">IFSC Code:</span>
                <span className="font-medium">{COMPANY_INFO.ifsc}</span>
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{COMPANY_INFO.branch}</span>
              </div>
            </div>
            <div className="pt-6 text-center border-t mt-4">
              <p className="text-xs text-muted-foreground">For {COMPANY_INFO.name}</p>
              <div className="h-12"></div>
              <p className="text-sm font-medium">Authorised Signatory</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="button" variant="secondary" onClick={() => setShowPreview(true)}>
          <Eye size={16} /> Preview & Download PDF
        </Button>
        <Button type="submit">
          <FileText size={16} /> Generate Proforma Invoice
        </Button>
      </div>

      <PDFDownloadWrapper
        filename={proformaNo.replace(/\//g, "_")}
        documentTitle="Proforma Invoice"
        open={showPreview}
        onClose={() => setShowPreview(false)}
      >
        <ProformaInvoicePreview
          proformaNo={proformaNo}
          date={date}
          quotationRef={quotationRef}
          customerName={customerName}
          customerAddress={customerAddress}
          customerState={customerState}
          customerGstin={customerGstin}
          customerPincode={customerPincode}
          items={items}
          calculations={calculations}
          isInterState={isInterState}
          validity={validity}
          paymentTerms={paymentTerms}
        />
      </PDFDownloadWrapper>
    </form>
  );
};
