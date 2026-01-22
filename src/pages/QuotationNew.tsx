import { AppLayout } from "@/components/layout/AppLayout";
import { QuotationForm } from "@/components/quotation/QuotationForm";

const QuotationNew = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Quotation</h1>
          <p className="text-muted-foreground">Generate a new quotation for your customer</p>
        </div>
        <QuotationForm />
      </div>
    </AppLayout>
  );
};

export default QuotationNew;
