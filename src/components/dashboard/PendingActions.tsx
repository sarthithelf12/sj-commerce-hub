import {
  FileText,
  ShoppingCart,
  CreditCard,
  PackageCheck,
  Receipt,
  Truck,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface PendingItem {
  icon: React.ReactNode;
  stage: string;
  description: string;
  count: number;
  urgency: "high" | "medium" | "low";
  path: string;
}

const pendingItems: PendingItem[] = [
  {
    icon: <FileText size={16} />,
    stage: "Quotations",
    description: "Awaiting client response",
    count: 3,
    urgency: "medium",
    path: "/documents/quotations",
  },
  {
    icon: <ShoppingCart size={16} />,
    stage: "Purchase Orders",
    description: "Pending supplier confirmation",
    count: 5,
    urgency: "high",
    path: "/purchases",
  },
  {
    icon: <CreditCard size={16} />,
    stage: "Payments",
    description: "Due to suppliers this week",
    count: 2,
    urgency: "high",
    path: "/expenses",
  },
  {
    icon: <PackageCheck size={16} />,
    stage: "Material Receipt",
    description: "Expected deliveries",
    count: 4,
    urgency: "medium",
    path: "/inventory",
  },
  {
    icon: <Receipt size={16} />,
    stage: "Invoices",
    description: "Pending dispatch to clients",
    count: 6,
    urgency: "low",
    path: "/sales/tax-invoices",
  },
  {
    icon: <Truck size={16} />,
    stage: "Delivery Challans",
    description: "In transit",
    count: 3,
    urgency: "low",
    path: "/sales/delivery-challans",
  },
];

const urgencyStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-accent/10 text-accent border-accent/20",
};

export const PendingActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-2 p-5 pb-3 border-b border-border">
        <Clock size={18} className="text-warning" />
        <h3 className="text-base font-semibold text-foreground">
          Pending Actions
        </h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {pendingItems.reduce((s, i) => s + i.count, 0)} total
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {pendingItems.map((item) => (
          <button
            key={item.stage}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="text-muted-foreground">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {item.stage}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${urgencyStyles[item.urgency]}`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
