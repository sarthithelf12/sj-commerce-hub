import { FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "sale" | "purchase" | "expense";
  party: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
  docType: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "INV-2024-001",
    type: "sale",
    party: "ABC Enterprises",
    amount: 45000,
    date: "2024-01-20",
    status: "paid",
    docType: "Tax Invoice",
  },
  {
    id: "PO-2024-015",
    type: "purchase",
    party: "XYZ Suppliers",
    amount: 32000,
    date: "2024-01-19",
    status: "pending",
    docType: "Purchase Order",
  },
  {
    id: "INV-2024-002",
    type: "sale",
    party: "Metro Distributors",
    amount: 78500,
    date: "2024-01-18",
    status: "paid",
    docType: "Tax Invoice",
  },
  {
    id: "EXP-2024-008",
    type: "expense",
    party: "Delhi Transport Co.",
    amount: 12000,
    date: "2024-01-18",
    status: "paid",
    docType: "Transport",
  },
  {
    id: "INV-2024-003",
    type: "sale",
    party: "Sharma Trading",
    amount: 25000,
    date: "2024-01-17",
    status: "overdue",
    docType: "Tax Invoice",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

export const RecentTransactions = () => {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        <button className="text-sm text-primary hover:underline font-medium">
          View All
        </button>
      </div>
      <div className="divide-y divide-border">
        {mockTransactions.map((txn) => (
          <div
            key={txn.id}
            className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                txn.type === "sale" && "bg-accent/10 text-accent",
                txn.type === "purchase" && "bg-destructive/10 text-destructive",
                txn.type === "expense" && "bg-warning/10 text-warning"
              )}
            >
              {txn.type === "sale" ? (
                <ArrowUpRight size={20} />
              ) : (
                <ArrowDownRight size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{txn.party}</p>
                <span
                  className={cn(
                    "status-badge",
                    txn.status === "paid" && "status-paid",
                    txn.status === "pending" && "status-pending",
                    txn.status === "overdue" && "status-overdue"
                  )}
                >
                  {txn.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {txn.docType} • {txn.id}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-semibold",
                  txn.type === "sale" ? "text-accent" : "text-foreground"
                )}
              >
                {txn.type === "sale" ? "+" : "-"} {formatCurrency(txn.amount)}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
