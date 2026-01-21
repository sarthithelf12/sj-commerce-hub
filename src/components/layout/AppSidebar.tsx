import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Truck,
  Users,
  BarChart3,
  Settings,
  Receipt,
  FileSpreadsheet,
  Building2,
  ChevronDown,
  ChevronRight,
  IndianRupee,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  children?: { to: string; label: string }[];
}

const NavItem = ({ to, icon, label, children }: NavItemProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = location.pathname === to || children?.some(c => location.pathname === c.to);

  if (children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "nav-item w-full justify-between",
            isActive && "nav-item-active"
          )}
        >
          <span className="flex items-center gap-3">
            {icon}
            {label}
          </span>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {isOpen && (
          <div className="ml-9 mt-1 space-y-1">
            {children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  cn(
                    "block px-3 py-2 text-sm rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
                    isActive && "text-sidebar-accent-foreground bg-sidebar-accent/50"
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn("nav-item", isActive && "nav-item-active")
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};

export const AppSidebar = () => {
  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center">
            <Building2 className="text-sidebar-accent-foreground" size={22} />
          </div>
          <div>
            <h1 className="text-sidebar-primary font-bold text-lg leading-tight">SJMART</h1>
            <p className="text-sidebar-muted text-xs">Private Limited</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">Documents</p>
        </div>
        <NavItem
          to="/documents"
          icon={<FileText size={20} />}
          label="Documents"
          children={[
            { to: "/documents/quotations", label: "Quotations" },
            { to: "/documents/proforma", label: "Proforma Invoices" },
            { to: "/documents/tax-invoices", label: "Tax Invoices" },
            { to: "/documents/delivery-challans", label: "Delivery Challans" },
          ]}
        />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">Transactions</p>
        </div>
        <NavItem to="/sales" icon={<IndianRupee size={20} />} label="Sales" />
        <NavItem to="/purchases" icon={<ShoppingCart size={20} />} label="Purchases" />
        <NavItem to="/expenses" icon={<Receipt size={20} />} label="Expenses" />
        <NavItem to="/inventory" icon={<Package size={20} />} label="Inventory" />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">Banking</p>
        </div>
        <NavItem
          to="/bank"
          icon={<Landmark size={20} />}
          label="Bank Management"
          children={[
            { to: "/bank/transactions", label: "Transactions" },
            { to: "/bank/matching", label: "Payment Matching" },
            { to: "/bank/guarantees", label: "Bank Guarantees" },
            { to: "/bank/loans", label: "Loans" },
          ]}
        />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">GST</p>
        </div>
        <NavItem
          to="/gst"
          icon={<FileSpreadsheet size={20} />}
          label="GST Management"
          children={[
            { to: "/gst/delhi", label: "Delhi GST" },
            { to: "/gst/maharashtra", label: "Maharashtra GST" },
          ]}
        />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">Reports</p>
        </div>
        <NavItem to="/reports" icon={<BarChart3 size={20} />} label="Reports" />
        <NavItem to="/parties" icon={<Users size={20} />} label="Parties" />
        <NavItem to="/transport" icon={<Truck size={20} />} label="Transport" />
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </div>
    </aside>
  );
};
