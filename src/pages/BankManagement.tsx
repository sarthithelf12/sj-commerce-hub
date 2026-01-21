import { useState } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2,
  CreditCard,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankStatementUpload } from "@/components/bank/BankStatementUpload";
import { TransactionList } from "@/components/bank/TransactionList";
import { BankGuarantees } from "@/components/bank/BankGuarantees";
import { LoanTracker } from "@/components/bank/LoanTracker";
import { MatchingQueue } from "@/components/bank/MatchingQueue";

const BankManagement = () => {
  const [activeTab, setActiveTab] = useState("transactions");

  // Summary stats
  const summaryStats = {
    totalBalance: "₹45,80,000",
    unmatchedCredits: 12,
    unmatchedDebits: 8,
    activeGuarantees: 3,
    totalLoans: "₹25,00,000",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bank Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload statements, match transactions, and track guarantees & loans
          </p>
        </div>
        <BankStatementUpload />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Landmark className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="text-lg font-bold text-foreground">{summaryStats.totalBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <ArrowDownRight className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unmatched Credits</p>
                <p className="text-lg font-bold text-foreground">{summaryStats.unmatchedCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ArrowUpRight className="text-destructive" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unmatched Debits</p>
                <p className="text-lg font-bold text-foreground">{summaryStats.unmatchedDebits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Shield className="text-warning" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active BGs</p>
                <p className="text-lg font-bold text-foreground">{summaryStats.activeGuarantees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Wallet className="text-info" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Loans</p>
                <p className="text-lg font-bold text-foreground">{summaryStats.totalLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="transactions" className="gap-2">
            <FileText size={16} />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="matching" className="gap-2">
            <CheckCircle2 size={16} />
            Payment Matching
          </TabsTrigger>
          <TabsTrigger value="guarantees" className="gap-2">
            <Shield size={16} />
            Bank Guarantees
          </TabsTrigger>
          <TabsTrigger value="loans" className="gap-2">
            <CreditCard size={16} />
            Loans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionList />
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <MatchingQueue />
        </TabsContent>

        <TabsContent value="guarantees" className="space-y-4">
          <BankGuarantees />
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          <LoanTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BankManagement;
