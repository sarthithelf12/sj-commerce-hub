import { 
  IndianRupee, 
  ShoppingCart, 
  TrendingUp, 
  Wallet,
  Calendar 
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
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

      {/* Quick Actions */}
      <section>
        <h2 className="section-title">Quick Actions</h2>
        <QuickActions />
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Sales"
          value="₹7,80,000"
          icon={<IndianRupee size={22} />}
          trend={{ value: "+12.5%", isPositive: true }}
          subtitle="42 invoices"
        />
        <MetricCard
          title="Monthly Purchases"
          value="₹4,10,000"
          icon={<ShoppingCart size={22} />}
          trend={{ value: "-5.2%", isPositive: true }}
          subtitle="28 orders"
        />
        <MetricCard
          title="Expenses"
          value="₹85,000"
          icon={<Wallet size={22} />}
          trend={{ value: "+8.1%", isPositive: false }}
          subtitle="Transport & Labour"
        />
        <MetricCard
          title="Net Profit"
          value="₹2,85,000"
          icon={<TrendingUp size={22} />}
          trend={{ value: "+18.3%", isPositive: true }}
          subtitle="This month"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChart />
        </div>
        <div>
          <GSTSummary />
        </div>
      </div>

      {/* Recent Transactions */}
      <section>
        <RecentTransactions />
      </section>
    </div>
  );
};

export default Dashboard;
