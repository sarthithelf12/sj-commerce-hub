import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, FileText, Building2, Phone, Mail, MapPin, Truck, Eye } from "lucide-react";
import { COMPANY_INFO } from "@/config/companyInfo";
import { PDFDownloadWrapper } from "@/components/shared/PDFDownloadWrapper";
import { DeliveryChallanPreview } from "@/components/sales/DeliveryChallanPreview";
import { saveDocument } from "@/utils/documentStorage";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProductSelect } from "@/components/shared/ProductSelect";
import { type Product, getProductStock } from "@/utils/productStorage";

interface LineItem {
  id: string;
  productId: string;
  product: string;
  hsn: string;
  specification: string;
  quantity: number;
  unit: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

const CHALLAN_TYPES = [
  "Supply of Goods on Approval",
  "Supply for Job Work",
  "Supply for Exhibition",
  "Supply for Export",
  "Others"
];

// COMPANY_INFO imported from config

export const DeliveryChallanForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challanNo, setChallanNo] = useState("DC/SJ/DL/25/0001");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [challanType, setChallanType] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerPincode, setCustomerPincode] = useState("");
  
  // Shipping details
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  
  // Transport details
  const [transporterName, setTransporterName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [ewayBillNo, setEwayBillNo] = useState("");
  
  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", productId: "", product: "", hsn: "", specification: "", quantity: 1, unit: "Nos" }
  ]);
  
  // Remarks
  const [remarks, setRemarks] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), productId: "", product: "", hsn: "", specification: "", quantity: 1, unit: "Nos" }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDocument("delivery-challan", challanNo, date, customerName, 0, {
      challanNo, date, challanType, invoiceRef, customerName, customerAddress,
      customerState, customerGstin, customerPincode, shippingName, shippingAddress,
      shippingState, shippingPincode, transporterName, vehicleNo, driverName,
      driverPhone, ewayBillNo, items, remarks,
    });
    toast({ title: "Delivery Challan saved", description: `${challanNo} has been saved successfully.` });
    navigate("/sales/delivery-challans");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Challan Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Challan Details</CardTitle>
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
                <Label htmlFor="challanNo" className="text-xs">Challan No.</Label>
                <Input
                  id="challanNo"
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="challanType" className="text-xs">Challan Type</Label>
                <Select value={challanType} onValueChange={setChallanType}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLAN_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoiceRef" className="text-xs">Invoice Reference</Label>
                <Input
                  id="invoiceRef"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  placeholder="Invoice No. (if any)"
                  className="h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consignee & Ship To */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consignee */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Consignee (Bill To)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-xs">Name / Organization</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerGstin" className="text-xs">GSTIN</Label>
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

        {/* Ship To */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Ship To (Delivery Address)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="shippingName" className="text-xs">Name / Organization</Label>
              <Input
                id="shippingName"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                placeholder="Shipping name"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shippingAddress" className="text-xs">Address</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter delivery address"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-1.5">
                <Label htmlFor="shippingPincode" className="text-xs">PIN Code</Label>
                <Input
                  id="shippingPincode"
                  value={shippingPincode}
                  onChange={(e) => setShippingPincode(e.target.value)}
                  placeholder="Enter PIN"
                  className="h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transport Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Truck size={18} />
            Transport Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="transporterName" className="text-xs">Transporter Name</Label>
              <Input
                id="transporterName"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                placeholder="Transporter"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vehicleNo" className="text-xs">Vehicle No.</Label>
              <Input
                id="vehicleNo"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g., DL01AB1234"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driverName" className="text-xs">Driver Name</Label>
              <Input
                id="driverName"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver name"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driverPhone" className="text-xs">Driver Phone</Label>
              <Input
                id="driverPhone"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="Phone number"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ewayBillNo" className="text-xs">E-Way Bill No.</Label>
              <Input
                id="ewayBillNo"
                value={ewayBillNo}
                onChange={(e) => setEwayBillNo(e.target.value)}
                placeholder="E-Way Bill"
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Items for Delivery</CardTitle>
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
                  <TableHead className="min-w-[200px]">Product Description</TableHead>
                  <TableHead className="w-24">HSN/SAC</TableHead>
                  <TableHead className="min-w-[200px]">Specification</TableHead>
                  <TableHead className="w-24 text-right">Quantity</TableHead>
                  <TableHead className="w-24">Unit</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <ProductSelect
                        value={item.productId}
                        onValueChange={(pid) => updateItem(item.id, "productId", pid)}
                        onProductSelect={(p: Product) => {
                          setItems(prev => prev.map(it => it.id === item.id ? { ...it, productId: p.id, product: p.name, hsn: p.hsnCode, unit: p.unit } : it));
                        }}
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
                        placeholder="Specifications"
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
                      <Select
                        value={item.unit}
                        onValueChange={(v) => updateItem(item.id, "unit", v)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nos">Nos</SelectItem>
                          <SelectItem value="Pcs">Pcs</SelectItem>
                          <SelectItem value="Kgs">Kgs</SelectItem>
                          <SelectItem value="Ltrs">Ltrs</SelectItem>
                          <SelectItem value="Mtrs">Mtrs</SelectItem>
                          <SelectItem value="Box">Box</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Remarks & Acknowledgement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any remarks or special instructions"
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p>• This is a Delivery Challan for goods movement</p>
              <p>• No billing is involved in this document</p>
              <p>• Original for Consignee, Duplicate for Transporter</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Acknowledgement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md p-4 space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">For {COMPANY_INFO.name}</p>
                <div className="h-12"></div>
                <p className="text-sm font-medium">Authorised Signatory</p>
              </div>
            </div>
            <div className="border rounded-md p-4 space-y-4">
              <p className="text-xs text-muted-foreground">Received the above goods in good condition</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Receiver's Name:</p>
                  <div className="border-b border-dashed h-6"></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Date & Time:</p>
                  <div className="border-b border-dashed h-6"></div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Signature & Stamp:</p>
                <div className="h-12 border rounded bg-muted/20"></div>
              </div>
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
          <FileText size={16} /> Generate Delivery Challan
        </Button>
      </div>

      <PDFDownloadWrapper
        filename={challanNo.replace(/\//g, "_")}
        documentTitle="Delivery Challan"
        open={showPreview}
        onClose={() => setShowPreview(false)}
      >
        <DeliveryChallanPreview
          challanNo={challanNo}
          date={date}
          challanType={challanType}
          invoiceRef={invoiceRef}
          customerName={customerName}
          customerAddress={customerAddress}
          customerState={customerState}
          customerGstin={customerGstin}
          shippingName={shippingName}
          shippingAddress={shippingAddress}
          shippingState={shippingState}
          shippingPincode={shippingPincode}
          transporterName={transporterName}
          vehicleNo={vehicleNo}
          driverName={driverName}
          driverPhone={driverPhone}
          ewayBillNo={ewayBillNo}
          items={items}
          remarks={remarks}
        />
      </PDFDownloadWrapper>
    </form>
  );
};
