import { useNavigate } from "react-router-dom";
import {
  FileText,
  FilePlus,
  Receipt,
  Truck,
  ShoppingCart,
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
    path: "/sales/tax-invoice/new",
    color: "text-accent",
  },
  {
    icon: <Receipt size={24} />,
    label: "Proforma Invoice",
    path: "/sales/proforma/new",
    color: "text-info",
  },
  {
    icon: <Truck size={24} />,
    label: "Delivery Challan",
    path: "/sales/delivery-challan/new",
    color: "text-warning",
  },
  {
    icon: <ShoppingCart size={24} />,
    label: "Purchase Order",
    path: "/purchases/new",
    color: "text-destructive",
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
