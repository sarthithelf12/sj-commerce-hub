import { useNavigate } from "react-router-dom";
import {
  FileText,
  ShoppingCart,
  CreditCard,
  PackageCheck,
  Receipt,
  Truck,
  ArrowRight,
} from "lucide-react";

interface PipelineStage {
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
  path: string;
  count: number;
  color: string;
  bgColor: string;
}

const stages: PipelineStage[] = [
  {
    icon: <FileText size={20} />,
    label: "Quotations",
    shortLabel: "Quote",
    path: "/documents/quotations",
    count: 3,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <ShoppingCart size={20} />,
    label: "Purchase Orders",
    shortLabel: "PO",
    path: "/purchases",
    count: 5,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: <CreditCard size={20} />,
    label: "Payments",
    shortLabel: "Pay",
    path: "/expenses",
    count: 2,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: <PackageCheck size={20} />,
    label: "Material In",
    shortLabel: "Receive",
    path: "/inventory",
    count: 4,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: <Receipt size={20} />,
    label: "Sale / Invoice",
    shortLabel: "Invoice",
    path: "/sales/tax-invoices",
    count: 6,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <Truck size={20} />,
    label: "Delivery",
    shortLabel: "Deliver",
    path: "/sales/delivery-challans",
    count: 3,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex items-center shrink-0">
            <button
              onClick={() => navigate(stage.path)}
              className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer group min-w-[80px]"
            >
              <div
                className={`${stage.bgColor} ${stage.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}
              >
                {stage.icon}
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight hidden sm:block">
                {stage.label}
              </span>
              <span className="text-xs font-medium text-foreground text-center leading-tight sm:hidden">
                {stage.shortLabel}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stage.bgColor} ${stage.color}`}
              >
                {stage.count} pending
              </span>
            </button>
            {index < stages.length - 1 && (
              <ArrowRight
                size={16}
                className="text-muted-foreground/40 shrink-0 mx-1"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
