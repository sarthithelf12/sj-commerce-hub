import { Building2 } from "lucide-react";

interface GSTData {
  state: string;
  gstin: string;
  outputGst: number;
  inputGst: number;
  netPayable: number;
}

const gstData: GSTData[] = [
  {
    state: "Delhi",
    gstin: "07AAAPL1234C1Z5",
    outputGst: 125000,
    inputGst: 85000,
    netPayable: 40000,
  },
  {
    state: "Maharashtra",
    gstin: "27AAAPL1234C1Z3",
    outputGst: 210000,
    inputGst: 145000,
    netPayable: 65000,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const GSTSummary = () => {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">GST Summary - Current Month</h3>
      </div>
      <div className="divide-y divide-border">
        {gstData.map((gst) => (
          <div key={gst.state} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{gst.state}</p>
                <p className="text-xs text-muted-foreground font-mono">{gst.gstin}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Output GST</p>
                <p className="font-semibold text-foreground text-sm">{formatCurrency(gst.outputGst)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Input GST</p>
                <p className="font-semibold text-foreground text-sm">{formatCurrency(gst.inputGst)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Net Payable</p>
                <p className="font-semibold text-accent text-sm">{formatCurrency(gst.netPayable)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
