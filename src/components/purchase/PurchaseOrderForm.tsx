import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Building2, Phone, Mail, MapPin, Truck } from "lucide-react";
import { numberToWords, formatCurrency } from "@/utils/numberToWords";
import { COMPANY_INFO } from "@/config/companyInfo";

interface LineItem {
  id: string;
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

export const PurchaseOrderForm = () => {
  const [poNo, setPoNo] = useState("PO/SJ/DL/25/0013");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Supplier details
  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierState, setSupplierState] = useState("");
  const [supplierGstin, setSupplierGstin] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  
  // Shipping address
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  
  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", product: "", hsn: "", specification: "", quantity: 1, unitPrice: 0, gstRate: 18 }
  ]);
  
  // Terms
  const [deliveryTimeline, setDeliveryTimeline] = useState("1 day");
  const [deliveryTerms, setDeliveryTerms] = useState("To be delivered by the vendor");
  const [paymentTerms, setPaymentTerms] = useState("Payment against Delivery");
  const [remarks, setRemarks] = useState("");

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

  // Determine if inter-state (IGST) or intra-state (CGST+SGST)
  const isInterState = useMemo(() => {
    return supplierState !== "" && supplierState !== COMPANY_INFO.state;
  }, [supplierState]);

  // Calculate totals
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
    console.log("Purchase Order submitted", { items, calculations });
    // TODO: Save and generate PDF
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice To - Company Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 size={18} />
              Invoice To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-bold text-lg text-primary">{COMPANY_INFO.name}</p>
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {COMPANY_INFO.address}
            </p>
            <p className="text-muted-foreground">GSTIN: <span className="font-medium text-foreground">{COMPANY_INFO.gstin}</span></p>
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

        {/* Supplier Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="poNo" className="text-xs">PO Number</Label>
                <Input
                  id="poNo"
                  value={poNo}
                  onChange={(e) => setPoNo(e.target.value)}
                  className="h-9"
                />
              </div>
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplierName" className="text-xs">Supplier Name</Label>
              <Input
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Enter supplier name"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplierAddress" className="text-xs">Address</Label>
              <Textarea
                id="supplierAddress"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                placeholder="Enter complete address"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="supplierState" className="text-xs">State</Label>
                <Select value={supplierState} onValueChange={setSupplierState}>
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
                <Label htmlFor="supplierGstin" className="text-xs">GSTIN</Label>
                <Input
                  id="supplierGstin"
                  value={supplierGstin}
                  onChange={(e) => setSupplierGstin(e.target.value)}
                  placeholder="Enter GSTIN"
                  className="h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="supplierPhone" className="text-xs">Phone</Label>
                <Input
                  id="supplierPhone"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="Phone number"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplierEmail" className="text-xs">Email</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  placeholder="Email address"
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
                  <TableHead className="min-w-[200px]">Specification</TableHead>
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
                        <Textarea
                          value={item.specification}
                          onChange={(e) => updateItem(item.id, "specification", e.target.value)}
                          placeholder="Detailed specifications"
                          className="min-h-[60px] text-xs"
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
                          step="0.01"
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

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Summary</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isInterState ? "Inter-State Supply (IGST)" : "Intra-State Supply (CGST + SGST)"}
            </p>
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

        {/* Shipping Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Truck size={18} />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="shippingAddress" className="text-xs">Address</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Street address / locality"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="shippingCity" className="text-xs">City</Label>
                <Input
                  id="shippingCity"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="City"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shippingState" className="text-xs">State</Label>
                <Select value={shippingState} onValueChange={setShippingState}>
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shippingPincode" className="text-xs">PIN Code</Label>
              <Input
                id="shippingPincode"
                value={shippingPincode}
                onChange={(e) => setShippingPincode(e.target.value)}
                placeholder="PIN Code"
                className="h-9 w-1/2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Terms & Remarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Delivery & Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deliveryTimeline" className="text-xs">Delivery Timeline</Label>
                <Input
                  id="deliveryTimeline"
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  placeholder="e.g., 1 day"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paymentTerms" className="text-xs">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., Payment against Delivery"
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliveryTerms" className="text-xs">Delivery Terms</Label>
              <Input
                id="deliveryTerms"
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                placeholder="e.g., To be delivered by the vendor"
                className="h-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any special requirements or notes for the supplier..."
              rows={5}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer with Signatory */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-end">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Terms Summary:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Delivery: {deliveryTimeline}</li>
                <li>{deliveryTerms}</li>
                <li>{paymentTerms}</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">For {COMPANY_INFO.name}</p>
              <div className="h-16 flex items-end justify-end">
                <p className="text-sm text-muted-foreground border-t pt-1 px-8">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit">
          Generate Purchase Order
        </Button>
      </div>
    </form>
  );
};
