import { useState } from "react";
import { 
  Plus, 
  Shield, 
  Calendar, 
  Building2, 
  AlertTriangle,
  CheckCircle,
  Clock
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

interface BankGuarantee {
  id: string;
  bgNumber: string;
  bank: string;
  beneficiary: string;
  amount: number;
  issueDate: string;
  expiryDate: string;
  purpose: string;
  status: "active" | "expiring-soon" | "expired" | "released";
  marginMoney: number;
}

const mockGuarantees: BankGuarantee[] = [
  {
    id: "BG001",
    bgNumber: "BG/HDFC/2024/001",
    bank: "HDFC Bank",
    beneficiary: "Delhi Metro Rail Corporation",
    amount: 500000,
    issueDate: "2024-01-01",
    expiryDate: "2025-01-01",
    purpose: "Performance Guarantee",
    status: "active",
    marginMoney: 50000,
  },
  {
    id: "BG002",
    bgNumber: "BG/ICICI/2024/015",
    bank: "ICICI Bank",
    beneficiary: "Maharashtra State Road Development",
    amount: 1000000,
    issueDate: "2023-06-15",
    expiryDate: "2024-02-15",
    purpose: "Tender Security",
    status: "expiring-soon",
    marginMoney: 100000,
  },
  {
    id: "BG003",
    bgNumber: "BG/SBI/2023/089",
    bank: "State Bank of India",
    beneficiary: "CPWD",
    amount: 250000,
    issueDate: "2023-03-01",
    expiryDate: "2024-03-01",
    purpose: "Advance Payment Guarantee",
    status: "active",
    marginMoney: 25000,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadge = (status: BankGuarantee["status"]) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-accent/10 text-accent gap-1">
          <CheckCircle size={12} />
          Active
        </Badge>
      );
    case "expiring-soon":
      return (
        <Badge className="bg-warning/10 text-warning gap-1">
          <AlertTriangle size={12} />
          Expiring Soon
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-destructive/10 text-destructive gap-1">
          <Clock size={12} />
          Expired
        </Badge>
      );
    case "released":
      return (
        <Badge className="bg-muted text-muted-foreground gap-1">
          Released
        </Badge>
      );
  }
};

const getDaysRemaining = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const BankGuarantees = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const totalBGAmount = mockGuarantees.reduce((sum, bg) => sum + bg.amount, 0);
  const totalMarginMoney = mockGuarantees.reduce((sum, bg) => sum + bg.marginMoney, 0);
  const activeCount = mockGuarantees.filter((bg) => bg.status === "active").length;
  const expiringSoonCount = mockGuarantees.filter((bg) => bg.status === "expiring-soon").length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total BG Amount</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalBGAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Margin Money Blocked</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalMarginMoney)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active BGs</p>
            <p className="text-xl font-bold text-accent">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Expiring Soon</p>
            <p className="text-xl font-bold text-warning">{expiringSoonCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Bank Guarantee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Bank Guarantee</DialogTitle>
              <DialogDescription>
                Record a new bank guarantee issued in favor of a beneficiary
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>BG Number</Label>
                  <Input placeholder="BG/BANK/2024/001" />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Bank</Label>
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
                <Label>Beneficiary</Label>
                <Input placeholder="Enter beneficiary name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>BG Amount</Label>
                  <Input type="number" placeholder="500000" />
                </div>
                <div className="space-y-2">
                  <Label>Margin Money</Label>
                  <Input type="number" placeholder="50000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Guarantee</SelectItem>
                    <SelectItem value="tender">Tender Security</SelectItem>
                    <SelectItem value="advance">Advance Payment Guarantee</SelectItem>
                    <SelectItem value="security">Security Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddOpen(false)}>Save Guarantee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Guarantees List */}
      <div className="space-y-3">
        {mockGuarantees.map((bg) => {
          const daysRemaining = getDaysRemaining(bg.expiryDate);
          const totalDays = Math.ceil(
            (new Date(bg.expiryDate).getTime() - new Date(bg.issueDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const progressValue = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));

          return (
            <Card key={bg.id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="text-primary" size={18} />
                      <span className="font-semibold text-foreground">{bg.bgNumber}</span>
                      {getStatusBadge(bg.status)}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 size={14} />
                      {bg.beneficiary}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">{formatCurrency(bg.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Margin: {formatCurrency(bg.marginMoney)}
                    </p>
                  </div>

                  {/* Dates & Progress */}
                  <div className="w-full lg:w-48">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        {new Date(bg.issueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span>
                        {new Date(bg.expiryDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired"}
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
