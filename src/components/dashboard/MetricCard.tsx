import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const MetricCard = ({ title, value, icon, trend, subtitle, className }: MetricCardProps) => {
  return (
    <div className={cn("metric-card animate-fade-in", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="metric-label">{title}</p>
          <p className="metric-value">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className={trend.isPositive ? "metric-trend-up" : "metric-trend-down"}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}
            <span className="text-muted-foreground font-normal ml-1">vs last month</span>
          </span>
        </div>
      )}
    </div>
  );
};
