import { COMPANY_INFO } from "@/config/companyInfo";
import { formatCurrency, numberToWords } from "@/utils/numberToWords";

interface LineItem {
  id: string;
  product: string;
  hsn: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

interface TaxInvoicePreviewProps {
  invoiceNo: string;
  date: string;
  poNumber: string;
  poDate: string;
  customerName: string;
  customerAddress: string;
  customerState: string;
  customerGstin: string;
  customerPincode: string;
  shippingName: string;
  shippingAddress: string;
  shippingState: string;
  shippingPincode: string;
  items: LineItem[];
  calculations: {
    totalBeforeTax: number;
    totalTax: number;
    grandTotal: number;
    gstBreakdown: Record<number, { cgst: number; sgst: number; igst: number; taxable: number }>;
  };
  isInterState: boolean;
  paymentTerms: string;
}

export const TaxInvoicePreview = (props: TaxInvoicePreviewProps) => {
  return (
    <div className="font-sans text-xs leading-relaxed" style={{ color: "#000" }}>
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-xl font-bold">{COMPANY_INFO.name}</h1>
        <p className="text-xs">{COMPANY_INFO.address}</p>
        <p className="text-xs">GSTIN: {COMPANY_INFO.gstin} | PAN: {COMPANY_INFO.pan}</p>
        <p className="text-xs">Phone: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email}</p>
        <h2 className="text-base font-bold mt-3 underline">TAX INVOICE</h2>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p><strong>Invoice No:</strong> {props.invoiceNo}</p>
          <p><strong>Date:</strong> {props.date}</p>
          {props.poNumber && <p><strong>PO No:</strong> {props.poNumber}</p>}
          {props.poDate && <p><strong>PO Date:</strong> {props.poDate}</p>}
        </div>
        <div className="text-right">
          <p><strong>Bill To:</strong> {props.customerName}</p>
          <p>{props.customerAddress}</p>
          <p>{props.customerState} {props.customerPincode}</p>
          {props.customerGstin && <p><strong>GSTIN:</strong> {props.customerGstin}</p>}
        </div>
      </div>

      {props.shippingName && (
        <div className="mb-4 p-2 border border-black">
          <p className="font-bold">Ship To:</p>
          <p>{props.shippingName}, {props.shippingAddress}, {props.shippingState} {props.shippingPincode}</p>
        </div>
      )}

      <table className="w-full border-collapse border border-black mb-4" style={{ fontSize: "10px" }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1">S.No</th>
            <th className="border border-black p-1 text-left">Product</th>
            <th className="border border-black p-1">HSN</th>
            <th className="border border-black p-1 text-left">Specification</th>
            <th className="border border-black p-1 text-right">Qty</th>
            <th className="border border-black p-1 text-right">Rate</th>
            <th className="border border-black p-1 text-right">Amount</th>
            <th className="border border-black p-1">GST%</th>
            {props.isInterState ? (
              <th className="border border-black p-1 text-right">IGST</th>
            ) : (
              <>
                <th className="border border-black p-1 text-right">CGST</th>
                <th className="border border-black p-1 text-right">SGST</th>
              </>
            )}
            <th className="border border-black p-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => {
            const amt = item.quantity * item.unitPrice;
            const tax = (amt * item.gstRate) / 100;
            return (
              <tr key={item.id}>
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1">{item.product}</td>
                <td className="border border-black p-1 text-center">{item.hsn}</td>
                <td className="border border-black p-1">{item.specification}</td>
                <td className="border border-black p-1 text-right">{item.quantity}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(amt)}</td>
                <td className="border border-black p-1 text-center">{item.gstRate}%</td>
                {props.isInterState ? (
                  <td className="border border-black p-1 text-right">{formatCurrency(tax)}</td>
                ) : (
                  <>
                    <td className="border border-black p-1 text-right">{formatCurrency(tax / 2)}</td>
                    <td className="border border-black p-1 text-right">{formatCurrency(tax / 2)}</td>
                  </>
                )}
                <td className="border border-black p-1 text-right">{formatCurrency(amt + tax)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end mb-4">
        <div className="text-right">
          <p>Subtotal: <strong>{formatCurrency(props.calculations.totalBeforeTax)}</strong></p>
          <p>Tax: <strong>{formatCurrency(props.calculations.totalTax)}</strong></p>
          <p className="text-sm font-bold mt-1">Grand Total: {formatCurrency(props.calculations.grandTotal)}</p>
          <p className="text-xs mt-1 italic">{numberToWords(props.calculations.grandTotal)}</p>
        </div>
      </div>

      <div className="mb-4 border-t border-black pt-2">
        <p className="font-bold">Payment Terms:</p>
        <p>{props.paymentTerms}</p>
      </div>

      <div className="mb-4">
        <p className="font-bold">Bank Details:</p>
        <p>Bank: {COMPANY_INFO.bankName} | A/c: {COMPANY_INFO.accountNumber} | IFSC: {COMPANY_INFO.ifsc} | Branch: {COMPANY_INFO.branch}</p>
      </div>

      <div className="flex justify-between items-end mt-12">
        <div></div>
        <div className="text-center">
          <p className="text-xs">For {COMPANY_INFO.name}</p>
          <div className="h-16"></div>
          <p className="border-t border-black pt-1 px-8 text-xs">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
};
