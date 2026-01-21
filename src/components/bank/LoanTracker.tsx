import { useState } from "react";
import { 
  Plus, 
  CreditCard, 
  Calendar, 
  Building2, 
  TrendingDown,
  IndianRupee,
  Percent
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Loan {
  id: string;
  loanNumber: string;
  bank: string;
  type: "term-loan" | "working-capital" | "overdraft" | "vehicle-loan" | "machinery-loan";
  sanctionedAmount: number;
  outstandingAmount: number;
  interestRate: number;
  emiAmount: number;
  startDate: string;
  endDate: string;
  nextEmiDate: string;
  status: "active" | "closed" | "overdue";
}

const mockLoans: Loan[] = [
  {
    id: "LOAN001",
    loanNumber: "TL/HDFC/2023/001",
    bank: "HDFC Bank",
    type: "term-loan",
    sanctionedAmount: 2500000,
    outstandingAmount: 1875000,
    interestRate: 10.5,
    emiAmount: 53000,
    startDate: "2023-01-15",
    endDate: "2028-01-15",
    nextEmiDate: "2024-02-05",
    status: "active",
  },
  {
    id: "LOAN002",
    loanNumber: "WC/ICICI/2023/045",
    bank: "ICICI Bank",
    type: "working-capital",
    sanctionedAmount: 1000000,
    outstandingAmount: 650000,
    interestRate: 11.25,
    emiAmount: 0,
    startDate: "2023-04-01",
    endDate: "2024-04-01",
    nextEmiDate: "2024-01-31",
    status: "active",
  },
  {
    id: "LOAN003",
    loanNumber: "VL/SBI/2022/089",
    bank: "State Bank of India",
    type: "vehicle-loan",
    sanctionedAmount: 800000,
    outstandingAmount: 320000,
    interestRate: 8.75,
    emiAmount: 17500,
    startDate: "2022-06-01",
    endDate: "2026-06-01",
    nextEmiDate: "2024-02-01",
    status: "active",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getLoanTypeBadge = (type: Loan["type"]) => {
  const types: Record<Loan["type"], { label: string; className: string }> = {
    "term-loan": { label: "Term Loan", className: "bg-primary/10 text-primary" },
    "working-capital": { label: "Working Capital", className: "bg-info/10 text-info" },
    "overdraft": { label: "Overdraft", className: "bg-warning/10 text-warning" },
    "vehicle-loan": { label: "Vehicle Loan", className: "bg-accent/10 text-accent" },
    "machinery-loan": { label: "Machinery Loan", className: "bg-secondary text-secondary-foreground" },
  };
  return <Badge className={types[type].className}>{types[type].label}</Badge>;
};

export const LoanTracker = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const totalSanctioned = mockLoans.reduce((sum, loan) => sum + loan.sanctionedAmount, 0);
  const totalOutstanding = mockLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
  const totalMonthlyEmi = mockLoans.reduce((sum, loan) => sum + loan.emiAmount, 0);
  const avgInterestRate =
    mockLoans.reduce((sum, loan) => sum + loan.interestRate, 0) / mockLoans.length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="text-primary" size={16} />
              <p className="text-xs text-muted-foreground">Total Sanctioned</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalSanctioned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="text-destructive" size={16} />
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-warning" size={16} />
              <p className="text-xs text-muted-foreground">Monthly EMI</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalMonthlyEmi)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="text-info" size={16} />
              <p className="text-xs text-muted-foreground">Avg Interest Rate</p>
            </div>
            <p className="text-xl font-bold text-foreground">{avgInterestRate.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Loan Account</DialogTitle>
              <DialogDescription>
                Record a new loan facility for tracking repayments and interest
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loan Account Number</Label>
                  <Input placeholder="TL/BANK/2024/001" />
                </div>
                <div className="space-y-2">
                  <Label>Bank</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hdfc">HDFC Bank</SelectItem>
                      <SelectItem value="icici">ICICI Bank</SelectItem>
                      <SelectItem value="sbi">SBI</SelectItem>
                      <SelectItem value="axis">Axis Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Loan Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term-loan">Term Loan</SelectItem>
                    <SelectItem value="working-capital">Working Capital</SelectItem>
                    <SelectItem value="overdraft">Overdraft</SelectItem>
                    <SelectItem value="vehicle-loan">Vehicle Loan</SelectItem>
                    <SelectItem value="machinery-loan">Machinery Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sanctioned Amount</Label>
                  <Input type="number" placeholder="2500000" />
                </div>
                <div className="space-y-2">
                  <Label>Outstanding Amount</Label>
                  <Input type="number" placeholder="1875000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input type="number" step="0.01" placeholder="10.5" />
                </div>
                <div className="space-y-2">
                  <Label>EMI Amount</Label>
                  <Input type="number" placeholder="53000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddOpen(false)}>Save Loan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loans List */}
      <div className="space-y-3">
        {mockLoans.map((loan) => {
          const repaidAmount = loan.sanctionedAmount - loan.outstandingAmount;
          const progressValue = (repaidAmount / loan.sanctionedAmount) * 100;

          return (
            <Card key={loan.id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="text-primary" size={18} />
                      <span className="font-semibold text-foreground">{loan.loanNumber}</span>
                      {getLoanTypeBadge(loan.type)}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 size={14} />
                      {loan.bank} • {loan.interestRate}% p.a.
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">
                      {formatCurrency(loan.outstandingAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {formatCurrency(loan.sanctionedAmount)}
                    </p>
                  </div>

                  {/* EMI Info */}
                  <div className="text-right">
                    {loan.emiAmount > 0 && (
                      <>
                        <p className="font-medium text-foreground">
                          {formatCurrency(loan.emiAmount)}/mo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Next:{" "}
                          {new Date(loan.nextEmiDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </>
                    )}
                    {loan.emiAmount === 0 && (
                      <p className="text-xs text-muted-foreground">Revolving facility</p>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="w-full lg:w-40">
                    <Progress value={progressValue} className="h-2" />
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      {progressValue.toFixed(0)}% repaid
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
