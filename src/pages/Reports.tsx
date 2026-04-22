import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart3, TrendingUp, TrendingDown, IndianRupee, FileText,
  ShoppingCart, Truck, CreditCard, Package, Receipt,
} from "lucide-react";
import { getDocuments } from "@/utils/documentStorage";
import { getPayments } from "@/utils/paymentStorage";
import { getClientPOs } from "@/utils/clientPoStorage";
import { getExpenses } from "@/utils/expenseStorage";
import { getEnquiries } from "@/utils/enquiryStorage";
import { formatCurrency } from "@/utils/numberToWords";

function getMonthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;
}

function getFY(dateStr: string) {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  const fy = m >= 4 ? y : y - 1;
  return `FY ${fy}-${String(fy + 1).slice(2)}`;
}

const MONTHS = [
  "All", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
];

const Reports = () => {
  const [period, setPeriod] = useState("all");

  const invoices = useMemo(() => getDocuments("tax-invoice"), []);
  const purchaseOrders = useMemo(() => getDocuments("purchase-order"), []);
  const deliveryChallans = useMemo(() => getDocuments("delivery-challan"), []);
  const quotations = useMemo(() => getDocuments("quotation"), []);
  const payments = useMemo(() => getPayments(), []);
  const clientPOs = useMemo(() => getClientPOs(), []);
  const expenses = useMemo(() => getExpenses(), []);
  const enquiries = useMemo(() => getEnquiries(), []);

  // Filter by period
  const filterDate = (dateStr: string) => {
    if (period === "all") return true;
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", { month: "short" }) === period;
  };

  const filteredInvoices = invoices.filter(i => filterDate(i.date));
  const filteredPOs = purchaseOrders.filter(p => filterDate(p.date));
  const filteredExpenses = expenses.filter(e => filterDate(e.date));
  const filteredPayments = payments.filter(p => filterDate(p.date));

  // KPIs
  const totalSales = filteredInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPurchase = filteredPOs.reduce((s, p) => s + p.amount, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalReceived = filteredPayments.reduce((s, p) => s + p.amountReceived, 0);
  const totalPending = filteredInvoices.reduce((s, i) => s + i.amount, 0) - totalReceived;
  const grossProfit = totalSales - totalPurchase - totalExpense;
  const margin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  // Monthly breakdown (all time)
  const monthlyMap = new Map<string, { sales: number; purchase: number; profit: number }>();
  invoices.forEach(i => {
    const k = getMonthLabel(i.date);
    const v = monthlyMap.get(k) || { sales: 0, purchase: 0, profit: 0 };
    v.sales += i.amount;
    monthlyMap.set(k, v);
  });
  purchaseOrders.forEach(p => {
    const k = getMonthLabel(p.date);
    const v = monthlyMap.get(k) || { sales: 0, purchase: 0, profit: 0 };
    v.purchase += p.amount;
    monthlyMap.set(k, v);
  });
  monthlyMap.forEach((v, k) => { v.profit = v.sales - v.purchase; monthlyMap.set(k, v); });
  const monthlyRows = Array.from(monthlyMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

  // Top customers by invoice value
  const customerMap = new Map<string, number>();
  invoices.forEach(i => {
    customerMap.set(i.partyName, (customerMap.get(i.partyName) || 0) + i.amount);
  });
  const topCustomers = Array.from(customerMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Enquiry conversion
  const totalEnq = enquiries.length;
  const convertedEnq = enquiries.filter(e => e.status === "converted" || e.status === "won").length;
  const conversionRate = totalEnq > 0 ? ((convertedEnq / totalEnq) * 100).toFixed(1) : "0";

  const kpis = [
    { label: "Total Sales", value: formatCurrency(totalSales), icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Purchase", value: formatCurrency(totalPurchase), icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Expenses", value: formatCurrency(totalExpense), icon: Receipt, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Gross Profit", value: formatCurrency(grossProfit), icon: TrendingUp, color: grossProfit >= 0 ? "text-emerald-600" : "text-red-600", bg: grossProfit >= 0 ? "bg-emerald-50" : "bg-red-50" },
    { label: "Margin %", value: `${margin.toFixed(1)}%`, icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Amount Received", value: formatCurrency(totalReceived), icon: CreditCard, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Outstanding", value: formatCurrency(Math.max(0, totalPending)), icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
    { label: "Enquiry Conversion", value: `${conversionRate}%`, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground text-sm">Business performance overview</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter period" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => (
                <SelectItem key={m} value={m === "All" ? "all" : m}>{m === "All" ? "All Time" : m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <Card key={k.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center`}>
                  <k.icon className={k.color} size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly P&L */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly P&L Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {monthlyRows.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">No data yet. Create invoices to see monthly summary.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Purchase</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyRows.map(([month, v]) => (
                      <TableRow key={month}>
                        <TableCell className="font-medium">{month}</TableCell>
                        <TableCell className="text-right text-green-700">{formatCurrency(v.sales)}</TableCell>
                        <TableCell className="text-right text-blue-700">{formatCurrency(v.purchase)}</TableCell>
                        <TableCell className={`text-right font-semibold ${v.profit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                          {formatCurrency(v.profit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topCustomers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">No invoice data yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map(([name, value], i) => (
                      <TableRow key={name}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell className="text-right font-semibold text-green-700">{formatCurrency(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workflow Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {[
                { label: "Enquiries", value: enquiries.length, sub: `${convertedEnq} converted`, color: "text-blue-600" },
                { label: "Quotations", value: quotations.length, sub: `${quotations.filter(q => q.status === "accepted").length} accepted`, color: "text-yellow-600" },
                { label: "Client POs", value: clientPOs.length, sub: `${clientPOs.filter(c => c.workflowStatus === "ordered").length} ordered`, color: "text-purple-600" },
                { label: "Delivery Challans", value: deliveryChallans.length, sub: `${deliveryChallans.filter(d => d.workflowStatus === "delivered").length} delivered`, color: "text-orange-600" },
                { label: "Invoices", value: invoices.length, sub: `${payments.filter(p => p.workflowStatus === "paid").length} paid`, color: "text-green-600" },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-lg bg-muted/30">
                  <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-sm font-medium mt-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Tax Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No invoices yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 10).map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.docNumber}</TableCell>
                      <TableCell>{new Date(inv.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{inv.partyName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          inv.workflowStatus === "paid" ? "bg-emerald-100 text-emerald-800" :
                          inv.workflowStatus === "raised" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {inv.workflowStatus || inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
