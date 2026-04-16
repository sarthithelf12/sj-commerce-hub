import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
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
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getParties, type Party } from "@/utils/partyStorage";
import { getEnquiry, saveEnquiry, type EnquiryItem } from "@/utils/enquiryStorage";
import { ProductSelect } from "@/components/shared/ProductSelect";
import { type Product } from "@/utils/productStorage";

const emptyItem = (): EnquiryItem => ({
  id: crypto.randomUUID(),
  productId: "",
  product: "",
  description: "",
  quantity: 1,
  unit: "pcs",
});

const EnquiryNew = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = !!id;

  const [date, setDate] = useState<Date>(new Date());
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [manualCustomer, setManualCustomer] = useState(false);
  const [items, setItems] = useState<EnquiryItem[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [enquiryNo, setEnquiryNo] = useState("Auto-generated");

  const customers = getParties("customer");
  const selectedParty = customers.find(p => p.id === customerId);

  useEffect(() => {
    if (isEdit && id) {
      const existing = getEnquiry(id);
      if (existing) {
        setEnquiryNo(existing.enquiryNo);
        setDate(new Date(existing.date));
        setCustomerId(existing.customerId);
        setCustomerName(existing.customerName);
        setItems(existing.items.length ? existing.items : [emptyItem()]);
        setNotes(existing.notes);
        if (!customers.find(p => p.id === existing.customerId)) {
          setManualCustomer(true);
        }
      }
    }
  }, [id]);

  const updateItem = (idx: number, field: keyof EnquiryItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const name = manualCustomer ? customerName : (selectedParty?.name || customerName);
    if (!name.trim()) {
      toast({ title: "Customer name is required", variant: "destructive" });
      return;
    }
    if (items.some(it => !it.product.trim())) {
      toast({ title: "All items must have a product name", variant: "destructive" });
      return;
    }

    saveEnquiry({
      date: date.toISOString(),
      customerId: manualCustomer ? "" : customerId,
      customerName: name,
      items,
      notes,
      status: "open",
      closureReason: "",
      linkedQuotationId: "",
    }, isEdit ? id : undefined);

    toast({ title: isEdit ? "Enquiry updated" : "Enquiry created" });
    navigate("/enquiries");
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Edit Enquiry" : "New Enquiry"}
        </h1>

        {/* Enquiry Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Enquiry Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Enquiry No</Label>
              <Input value={enquiryNo} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={d => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Customer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Customer</CardTitle>
              <Button variant="link" size="sm" className="text-xs" onClick={() => { setManualCustomer(!manualCustomer); setCustomerId(""); setCustomerName(""); }}>
                {manualCustomer ? "Select from list" : "Type manually"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {manualCustomer ? (
              <div>
                <Label>Customer Name</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter customer name" />
                <p className="text-xs text-muted-foreground mt-1">Save to Parties for future use</p>
              </div>
            ) : (
              <div>
                <Label>Select Customer</Label>
                <Select value={customerId} onValueChange={val => { setCustomerId(val); const p = customers.find(c => c.id === val); if (p) setCustomerName(p.name); }}>
                  <SelectTrigger><SelectValue placeholder="Choose a customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedParty && !manualCustomer && (
              <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
                <p><span className="font-medium">Address:</span> {selectedParty.address}, {selectedParty.city}, {selectedParty.state} - {selectedParty.pincode}</p>
                <p><span className="font-medium">Phone:</span> {selectedParty.phone}</p>
                {selectedParty.gstin && <p><span className="font-medium">GSTIN:</span> {selectedParty.gstin}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Requirement Items</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setItems([...items, emptyItem()])}>
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3 relative">
                {items.length > 1 && (
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeItem(idx)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Label>Product / Item Name *</Label>
                    <ProductSelect
                      value={item.productId}
                      onValueChange={(pid) => updateItem(idx, "productId", pid)}
                      onProductSelect={(p: Product) => {
                        setItems(prev => prev.map((it, i) => i === idx ? { ...it, productId: p.id, product: p.name, unit: p.unit } : it));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Qty</Label>
                      <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, "quantity", parseInt(e.target.value) || 1)} />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} placeholder="pcs" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Description / Specification</Label>
                  <Textarea value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Optional details..." rows={2} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any internal notes about this enquiry..." rows={3} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/enquiries")}>Cancel</Button>
          <Button onClick={handleSave}>Save as Draft</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default EnquiryNew;
