import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IndianRupee, TrendingUp, TrendingDown, FileSpreadsheet } from "lucide-react";
import { getDocuments } from "@/utils/documentStorage";
import { formatCurrency } from "@/utils/numberToWords";

// Determine state from document data
function getDocState(doc: ReturnType<typeof getDocuments>[number]): string {
  const data = doc.data as Record<string, unknown>;
  const state = (data.customerState as string) || (data.supplierState as string) || "";
  return state.toLowerCase();
}

function getGSTBreakdown(amount: number, gstRate: number, supplyType: string) {
  const basicAmt = amount / (1 + gstRate / 100);
  const gstAmt = amount - basicAmt;
  if (supplyType === "IGST" || supplyType === "igst") {
    return { igst: gstAmt, cgst: 0, sgst: 0, basic: basicAmt };
  }
  return { igst: 0, cgst: gstAmt / 2, sgst: gstAmt / 2, basic: basicAmt };
}

const MONTHS = ["All", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

interface GSTSectionProps {
  stateLabel: string;
  stateKey: string; // "delhi" | "maharashtra"
}

const GSTSection = ({ stateLabel, stateKey }: GSTSectionProps) => {
  const [period, setPeriod] = useState("all");

  const invoices = useMemo(() => getDocuments("tax-invoice"), []);
  const purchaseOrders = useMemo(() => getDocuments("purchase-order"), []);

  // State-based GSTIN prefix
  const gstinPrefix = stateKey === "delhi" ? "07" : "27";

  // Filter invoices for this state (output tax)
  const filterDate = (dateStr: string) => {
    if (period === "all") return true;
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", { month: "short" }) === period;
  };

  const stateInvoices = invoices.filter(inv => {
    if (!filterDate(inv.date)) return false;
    const data = inv.data as Record<string, unknown>;
    const custState = (data.customerState as string || "").toLowerCase();
    const docState = stateKey === "delhi"
      ? custState.includes("delhi")
      : custState.includes("maharashtra") || custState.includes("mumbai") || custState.includes("pune");
    // Also check if company entity matches
    const companyGstin = (data.companyGstin as string) || "";
    const entityMatch = companyGstin.startsWith(gstinPrefix);
    return docState || entityMatch;
  });

  const statePOs = purchaseOrders.filter(po => {
    if (!filterDate(po.date)) return false;
    const data = po.data as Record<string, unknown>;
    const supState = (data.supplierState as string || "").toLowerCase();
    const docState = stateKey === "delhi"
      ? supState.includes("delhi")
      : supState.includes("maharashtra") || supState.includes("mumbai") || supState.includes("pune");
    const companyGstin = (data.companyGstin as string) || "";
    return docState || companyGstin.startsWith(gstinPrefix);
  });

  // Calculate output GST (from sales invoices)
  let outIGST = 0, outCGST = 0, outSGST = 0, outBasic = 0;
  stateInvoices.forEach(inv => {
    const data = inv.data as Record<string, unknown>;
    const supplyType = (data.supplyType as string) || "IGST";
    const gstRate = Number(data.totalGstRate || 18);
    const bd = getGSTBreakdown(inv.amount, gstRate, supplyType);
    outIGST += bd.igst;
    outCGST += bd.cgst;
    outSGST += bd.sgst;
    outBasic += bd.basic;
  });

  // Calculate input GST (from purchase orders)
  let inIGST = 0, inCGST = 0, inSGST = 0, inBasic = 0;
  statePOs.forEach(po => {
    const data = po.data as Record<string, unknown>;
    const items = (data.items as Array<{ gstRate: number; quantity: number; unitPrice: number }>) || [];
    items.forEach(item => {
      const lineAmt = (item.quantity || 0) * (item.unitPrice || 0);
      const gstAmt = lineAmt * ((item.gstRate || 18) / 100);
      // PO from same state = CGST+SGST, else IGST
      const supplierState = (data.supplierState as string || "").toLowerCase();
      const sameState = stateKey === "delhi"
        ? supplierState.includes("delhi")
        : supplierState.includes("maharashtra") || supplierState.includes("mumbai");
      if (sameState) {
        inCGST += gstAmt / 2;
        inSGST += gstAmt / 2;
      } else {
        inIGST += gstAmt;
      }
      inBasic += lineAmt;
    });
  });

  const netIGST = outIGST - inIGST;
  const netCGST = outCGST - inCGST;
  const netSGST = outSGST - inSGST;
  const netTotal = netIGST + netCGST + netSGST;

  // Monthly GST table
  const monthlyGST = new Map<string, { outBasic: number; outGST: number; inBasic: number; inGST: number; net: number }>();
  stateInvoices.forEach(inv => {
    const d = new Date(inv.date);
    const k = `${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;
    const data = inv.data as Record<string, unknown>;
    const supplyType = (data.supplyType as string) || "IGST";
    const gstRate = Number(data.totalGstRate || 18);
    const bd = getGSTBreakdown(inv.amount, gstRate, supplyType);
    const v = monthlyGST.get(k) || { outBasic: 0, outGST: 0, inBasic: 0, inGST: 0, net: 0 };
    v.outBasic += bd.basic;
    v.outGST += bd.igst + bd.cgst + bd.sgst;
    monthlyGST.set(k, v);
  });
  statePOs.forEach(po => {
    const d = new Date(po.date);
    const k = `${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;
    const data = po.data as Record<string, unknown>;
    const items = (data.items as Array<{ gstRate: number; quantity: number; unitPrice: number }>) || [];
    let inG = 0, inB = 0;
    items.forEach(item => {
      inB += (item.quantity || 0) * (item.unitPrice || 0);
      inG += inB * ((item.gstRate || 18) / 100);
    });
    const v = monthlyGST.get(k) || { outBasic: 0, outGST: 0, inBasic: 0, inGST: 0, net: 0 };
    v.inBasic += inB;
    v.inGST += inG;
    v.net = v.outGST - v.inGST;
    monthlyGST.set(k, v);
  });
  const monthlyRows = Array.from(monthlyGST.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

  const summaryCards = [
    { label: "Output Tax (IGST)", value: formatCurrency(outIGST), color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Output Tax (CGST)", value: formatCurrency(outCGST), color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Output Tax (SGST)", value: formatCurrency(outSGST), color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Input Credit (IGST)", value: formatCurrency(inIGST), color: "text-green-600", bg: "bg-green-50" },
    { label: "Input Credit (CGST)", value: formatCurrency(inCGST), color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Input Credit (SGST)", value: formatCurrency(inSGST), color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-5">
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {stateLabel} — GSTIN prefix: <span className="font-mono font-semibold">{gstinPrefix}XXXXXXXX</span>
        </p>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map(m => (
              <SelectItem key={m} value={m === "All" ? "all" : m}>{m === "All" ? "All Time" : m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Net Payable Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-2 ${netTotal >= 0 ? "border-red-200" : "border-green-200"}`}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Net IGST {netTotal >= 0 ? "Payable" : "Credit"}</p>
            <p className={`text-2xl font-bold ${netIGST >= 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(Math.abs(netIGST))}
            </p>
          </CardContent>
        </Card>
        <Card className={`border-2 ${netCGST >= 0 ? "border-red-200" : "border-green-200"}`}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Net CGST {netCGST >= 0 ? "Payable" : "Credit"}</p>
            <p className={`text-2xl font-bold ${netCGST >= 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(Math.abs(netCGST))}
            </p>
          </CardContent>
        </Card>
        <Card className={`border-2 ${netSGST >= 0 ? "border-red-200" : "border-green-200"}`}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Net SGST {netSGST >= 0 ? "Payable" : "Credit"}</p>
            <p className={`text-2xl font-bold ${netSGST >= 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(Math.abs(netSGST))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net total banner */}
      <div className={`rounded-lg p-4 flex items-center justify-between ${netTotal >= 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
        <div className="flex items-center gap-2">
          {netTotal >= 0 ? <TrendingUp className="text-red-600" size={20} /> : <TrendingDown className="text-green-600" size={20} />}
          <span className="font-semibold text-sm">
            Total GST {netTotal >= 0 ? "Payable to Government" : "Input Credit Available"}
          </span>
        </div>
        <span className={`text-xl font-bold ${netTotal >= 0 ? "text-red-600" : "text-green-600"}`}>
          {formatCurrency(Math.abs(netTotal))}
        </span>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {summaryCards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <IndianRupee className={c.color} size={18} />
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className={`font-semibold ${c.color}`}>{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Month-wise GST Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {monthlyRows.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No {stateLabel} transactions found. Create invoices with {stateLabel} customer/supplier details.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Taxable Sales</TableHead>
                  <TableHead className="text-right">Output GST</TableHead>
                  <TableHead className="text-right">Input Credit</TableHead>
                  <TableHead className="text-right">Net Payable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyRows.map(([month, v]) => (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(v.outBasic)}</TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(v.outGST)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(v.inGST)}</TableCell>
                    <TableCell className={`text-right font-semibold ${v.net >= 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(Math.abs(v.net))}
                      <span className="text-xs ml-1">{v.net >= 0 ? "pay" : "cr"}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent invoices */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Invoices — {stateLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stateInvoices.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground text-sm">No invoices for {stateLabel}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stateInvoices.slice(0, 8).map(inv => {
                  const data = inv.data as Record<string, unknown>;
                  const supplyType = (data.supplyType as string) || "—";
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.docNumber}</TableCell>
                      <TableCell>{new Date(inv.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{inv.partyName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          supplyType === "IGST" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                        }>
                          {supplyType}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const GSTManagement = () => {
  const location = useLocation();
  const activeTab = location.pathname.includes("/maharashtra") ? "maharashtra" : "delhi";

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="text-primary" size={24} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">GST Management</h1>
            <p className="text-muted-foreground text-sm">
              Track input/output GST — Delhi (07ABPCS9776C1ZO) &amp; Maharashtra (27ABPCS9776C1ZM)
            </p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="delhi">Delhi GST (07)</TabsTrigger>
            <TabsTrigger value="maharashtra">Maharashtra GST (27)</TabsTrigger>
          </TabsList>
          <TabsContent value="delhi">
            <GSTSection stateLabel="Delhi" stateKey="delhi" />
          </TabsContent>
          <TabsContent value="maharashtra">
            <GSTSection stateLabel="Maharashtra" stateKey="maharashtra" />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default GSTManagement;
