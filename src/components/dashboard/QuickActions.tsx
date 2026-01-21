import { useNavigate } from "react-router-dom";
import {
  FileText,
  FilePlus,
  Receipt,
  Truck,
  ShoppingCart,
  Package,
} from "lucide-react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    icon: <FileText size={24} />,
    label: "New Quotation",
    path: "/documents/quotations/new",
    color: "text-primary",
  },
  {
    icon: <FilePlus size={24} />,
    label: "Tax Invoice",
    path: "/documents/tax-invoices/new",
    color: "text-accent",
  },
  {
    icon: <Receipt size={24} />,
    label: "Proforma Invoice",
    path: "/documents/proforma/new",
    color: "text-info",
  },
  {
    icon: <Truck size={24} />,
    label: "Delivery Challan",
    path: "/documents/delivery-challans/new",
    color: "text-warning",
  },
  {
    icon: <ShoppingCart size={24} />,
    label: "Add Purchase",
    path: "/purchases/new",
    color: "text-destructive",
  },
  {
    icon: <Package size={24} />,
    label: "Add Sale",
    path: "/sales/new",
    color: "text-success",
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.path)}
          className="quick-action-btn group"
        >
          <div className={`${action.color} group-hover:scale-110 transition-transform`}>
            {action.icon}
          </div>
          <span className="text-xs font-medium text-foreground text-center leading-tight">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};
