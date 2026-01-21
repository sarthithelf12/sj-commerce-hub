import { useState } from "react";
import { 
  ArrowRight, 
  Check, 
  X, 
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Link2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UnmatchedTransaction {
  id: string;
  date: string;
  description: string;
  type: "credit" | "debit";
  amount: number;
  suggestedMatches: SuggestedMatch[];
}

interface SuggestedMatch {
  id: string;
  type: "invoice" | "purchase" | "expense";
  number: string;
  party: string;
  amount: number;
  date: string;
  confidence: "high" | "medium" | "low";
}

const mockUnmatchedCredits: UnmatchedTransaction[] = [
  {
    id: "TXN004",
    date: "2024-01-12",
    description: "UPI-PAYMENT RECEIVED",
    type: "credit",
    amount: 45000,
    suggestedMatches: [
      {
        id: "INV-2024-015",
        type: "invoice",
        number: "INV-2024-015",
        party: "Sharma Enterprises",
        amount: 45000,
        date: "2024-01-08",
        confidence: "high",
      },
      {
        id: "INV-2024-012",
        type: "invoice",
        number: "INV-2024-012",
        party: "Kumar & Sons",
        amount: 44500,
        date: "2024-01-05",
        confidence: "low",
      },
    ],
  },
  {
    id: "TXN006",
    date: "2024-01-10",
    description: "CHQ DEP-CUSTOMER PAYMENT",
    type: "credit",
    amount: 200000,
    suggestedMatches: [
      {
        id: "INV-2024-010",
        type: "invoice",
        number: "INV-2024-010",
        party: "ABC Industries",
        amount: 198500,
        date: "2024-01-02",
        confidence: "medium",
      },
    ],
  },
];

const mockUnmatchedDebits: UnmatchedTransaction[] = [
  {
    id: "TXN008",
    date: "2024-01-08",
    description: "NEFT-VENDOR PAYMENT",
    type: "debit",
    amount: 75000,
    suggestedMatches: [
      {
        id: "PO-2024-022",
        type: "purchase",
        number: "PO-2024-022",
        party: "Steel Suppliers Ltd",
        amount: 75000,
        date: "2024-01-03",
        confidence: "high",
      },
    ],
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getConfidenceBadge = (confidence: SuggestedMatch["confidence"]) => {
  switch (confidence) {
    case "high":
      return <Badge className="bg-accent/10 text-accent">High Match</Badge>;
    case "medium":
      return <Badge className="bg-warning/10 text-warning">Medium Match</Badge>;
    case "low":
      return <Badge className="bg-muted text-muted-foreground">Low Match</Badge>;
  }
};

const expenseCategories = [
  "Transport",
  "Labour",
  "Utilities",
  "Rent",
  "Office Supplies",
  "Maintenance",
  "Other",
];

export const MatchingQueue = () => {
  const [matchType, setMatchType] = useState<"credits" | "debits">("credits");
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>("");
  const { toast } = useToast();

  const unmatchedTransactions =
    matchType === "credits" ? mockUnmatchedCredits : mockUnmatchedDebits;

  const handleMatch = (txnId: string, matchId: string) => {
    toast({
      title: "Transaction matched",
      description: `Transaction ${txnId} has been matched with ${matchId}`,
    });
  };

  const handleRecordAsExpense = (txnId: string, category: string) => {
    if (!category) {
      toast({
        title: "Select category",
        description: "Please select an expense category",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Expense recorded",
      description: `Transaction ${txnId} recorded as ${category} expense`,
    });
  };

  const handleIgnore = (txnId: string) => {
    toast({
      title: "Transaction ignored",
      description: `Transaction ${txnId} has been marked as ignored`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Toggle between credits and debits */}
      <div className="flex gap-2">
        <Button
          variant={matchType === "credits" ? "default" : "outline"}
          onClick={() => setMatchType("credits")}
          className="gap-2"
        >
          <ArrowDownRight size={16} />
          Unmatched Credits ({mockUnmatchedCredits.length})
        </Button>
        <Button
          variant={matchType === "debits" ? "default" : "outline"}
          onClick={() => setMatchType("debits")}
          className="gap-2"
        >
          <ArrowUpRight size={16} />
          Unmatched Debits ({mockUnmatchedDebits.length})
        </Button>
      </div>

      {/* Matching Cards */}
      {unmatchedTransactions.map((txn) => (
        <Card key={txn.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {txn.type === "credit" ? (
                    <ArrowDownRight className="text-accent" size={18} />
                  ) : (
                    <ArrowUpRight className="text-destructive" size={18} />
                  )}
                  {formatCurrency(txn.amount)}
                </CardTitle>
                <CardDescription className="mt-1">
                  {new Date(txn.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  • {txn.description}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => handleIgnore(txn.id)}
              >
                <X size={16} />
                Ignore
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Suggested Matches */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Suggested Matches
              </p>
              {txn.suggestedMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-sm">{match.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {match.party} •{" "}
                        {new Date(match.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <span className="font-medium">{formatCurrency(match.amount)}</span>
                    {getConfidenceBadge(match.confidence)}
                  </div>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleMatch(txn.id, match.id)}
                  >
                    <Link2 size={14} />
                    Match
                  </Button>
                </div>
              ))}
            </div>

            {/* Record as Expense (for debits) */}
            {txn.type === "debit" && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Or record as expense
                </p>
                <div className="flex gap-2">
                  <Select
                    value={selectedExpenseCategory}
                    onValueChange={setSelectedExpenseCategory}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleRecordAsExpense(txn.id, selectedExpenseCategory)
                    }
                  >
                    Record Expense
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {unmatchedTransactions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Check className="mx-auto text-accent mb-3" size={40} />
            <p className="font-medium text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No unmatched {matchType} to process
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
