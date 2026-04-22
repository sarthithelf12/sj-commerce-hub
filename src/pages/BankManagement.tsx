import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Shield,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankStatementUpload } from "@/components/bank/BankStatementUpload";
import { TransactionList } from "@/components/bank/TransactionList";
import { BankGuarantees } from "@/components/bank/BankGuarantees";
import { LoanTracker } from "@/components/bank/LoanTracker";
import { MatchingQueue } from "@/components/bank/MatchingQueue";
import { useLocation } from "react-router-dom";

const BankManagement = () => {
  const location = useLocation();

  // Determine active tab from URL
  const getInitialTab = () => {
    if (location.pathname.includes("/matching")) return "matching";
    if (location.pathname.includes("/guarantees")) return "guarantees";
    if (location.pathname.includes("/loans")) return "loans";
    return "transactions";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  const summaryStats = {
    totalBalance: "₹45,80,000",
    unmatchedCredits: 12,
    unmatchedDebits: 8,
    activeGuarantees: 3,
    totalLoans: "₹25,00,000",
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bank Management</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Upload statements, match transactions, and track guarantees &amp; loans
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
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <ArrowDownRight className="text-green-600" size={20} />
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
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <ArrowUpRight className="text-red-600" size={20} />
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
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Shield className="text-yellow-600" size={20} />
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
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Wallet className="text-blue-600" size={20} />
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
    </AppLayout>
  );
};

export default BankManagement;
