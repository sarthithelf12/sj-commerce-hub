import { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  status: "matched" | "unmatched" | "ignored";
  matchedWith?: string;
  category?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "TXN001",
    date: "2024-01-15",
    description: "NEFT-ABC TRADERS-INV2024001",
    reference: "NEFT123456789",
    type: "credit",
    amount: 125000,
    balance: 4580000,
    status: "matched",
    matchedWith: "INV-2024-001",
    category: "Sales Receipt",
  },
  {
    id: "TXN002",
    date: "2024-01-14",
    description: "RTGS-XYZ SUPPLIERS-PO2024015",
    reference: "RTGS987654321",
    type: "debit",
    amount: 85000,
    balance: 4455000,
    status: "matched",
    matchedWith: "PO-2024-015",
    category: "Purchase Payment",
  },
  {
    id: "TXN003",
    date: "2024-01-13",
    description: "IMPS-DELHI TRANSPORT SERVICES",
    reference: "IMPS456789123",
    type: "debit",
    amount: 15000,
    balance: 4540000,
    status: "matched",
    category: "Transport Expense",
  },
  {
    id: "TXN004",
    date: "2024-01-12",
    description: "UPI-PAYMENT RECEIVED",
    reference: "UPI789123456",
    type: "credit",
    amount: 45000,
    balance: 4555000,
    status: "unmatched",
  },
  {
    id: "TXN005",
    date: "2024-01-11",
    description: "NEFT-LABOUR CONTRACTOR PAYMENT",
    reference: "NEFT111222333",
    type: "debit",
    amount: 28000,
    balance: 4510000,
    status: "matched",
    category: "Labour Expense",
  },
  {
    id: "TXN006",
    date: "2024-01-10",
    description: "CHQ DEP-CUSTOMER PAYMENT",
    reference: "CHQ445566",
    type: "credit",
    amount: 200000,
    balance: 4538000,
    status: "unmatched",
  },
  {
    id: "TXN007",
    date: "2024-01-09",
    description: "BANK CHARGES",
    reference: "SYS001",
    type: "debit",
    amount: 1500,
    balance: 4338000,
    status: "ignored",
    category: "Bank Charges",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadge = (status: Transaction["status"]) => {
  switch (status) {
    case "matched":
      return (
        <Badge className="bg-accent/10 text-accent hover:bg-accent/20 gap-1">
          <CheckCircle2 size={12} />
          Matched
        </Badge>
      );
    case "unmatched":
      return (
        <Badge className="bg-warning/10 text-warning hover:bg-warning/20 gap-1">
          <Clock size={12} />
          Unmatched
        </Badge>
      );
    case "ignored":
      return (
        <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 gap-1">
          <XCircle size={12} />
          Ignored
        </Badge>
      );
  }
};

export const TransactionList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredTransactions = mockTransactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || txn.type === filterType;
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Bank Transactions</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search transactions..."
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credits</SelectItem>
                <SelectItem value="debit">Debits</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="unmatched">Unmatched</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Reference</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Balance</th>
                <th>Status</th>
                <th>Category / Match</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="whitespace-nowrap">
                    {new Date(txn.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="max-w-[250px] truncate">{txn.description}</td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {txn.reference}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <span
                      className={`flex items-center justify-end gap-1 font-medium ${
                        txn.type === "credit"
                          ? "text-accent"
                          : "text-destructive"
                      }`}
                    >
                      {txn.type === "credit" ? (
                        <ArrowDownRight size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                      {formatCurrency(txn.amount)}
                    </span>
                  </td>
                  <td className="text-right font-medium whitespace-nowrap">
                    {formatCurrency(txn.balance)}
                  </td>
                  <td>{getStatusBadge(txn.status)}</td>
                  <td className="text-sm text-muted-foreground">
                    {txn.matchedWith && (
                      <span className="text-primary font-medium">
                        {txn.matchedWith}
                      </span>
                    )}
                    {txn.category && !txn.matchedWith && txn.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
