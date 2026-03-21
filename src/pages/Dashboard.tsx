import { 
  IndianRupee, 
  ShoppingCart, 
  TrendingUp, 
  Truck,
  Calendar 
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PendingActions } from "@/components/dashboard/PendingActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { GSTSummary } from "@/components/dashboard/GSTSummary";

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} />
            {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium">Offline Mode</span>
        </div>
      </div>

      {/* Business Flow Pipeline */}
      <section>
        <h2 className="section-title">Business Flow</h2>
        <QuickActions />
      </section>

      {/* Pending Actions + GST Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PendingActions />
        </div>
        <div>
          <GSTSummary />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Receivables"
          value="₹12,40,000"
          icon={<IndianRupee size={22} />}
          trend={{ value: "+12.5%", isPositive: true }}
          subtitle="18 invoices outstanding"
        />
        <MetricCard
          title="Total Payables"
          value="₹6,80,000"
          icon={<ShoppingCart size={22} />}
          trend={{ value: "-5.2%", isPositive: true }}
          subtitle="12 POs pending payment"
        />
        <MetricCard
          title="Orders in Pipeline"
          value="23"
          icon={<TrendingUp size={22} />}
          trend={{ value: "+8.1%", isPositive: true }}
          subtitle="Across all stages"
        />
        <MetricCard
          title="Deliveries This Week"
          value="7"
          icon={<Truck size={22} />}
          trend={{ value: "+3", isPositive: true }}
          subtitle="4 dispatched, 3 scheduled"
        />
      </div>

      {/* Charts and Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChart />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
