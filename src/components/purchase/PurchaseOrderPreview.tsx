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

interface PurchaseOrderPreviewProps {
  poNo: string;
  date: string;
  supplierName: string;
  supplierAddress: string;
  supplierState: string;
  supplierGstin: string;
  supplierPhone: string;
  supplierEmail: string;
  shippingAddress: string;
  shippingCity: string;
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
  deliveryTimeline: string;
  deliveryTerms: string;
  paymentTerms: string;
  remarks: string;
}

export const PurchaseOrderPreview = (props: PurchaseOrderPreviewProps) => {
  return (
    <div className="font-sans text-xs leading-relaxed" style={{ color: "#000" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-xl font-bold">{COMPANY_INFO.name}</h1>
        <p className="text-xs">{COMPANY_INFO.address}</p>
        <p className="text-xs">GSTIN: {COMPANY_INFO.gstin} | PAN: {COMPANY_INFO.pan}</p>
        <p className="text-xs">Phone: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email}</p>
        <h2 className="text-base font-bold mt-3 underline">PURCHASE ORDER</h2>
      </div>

      {/* PO Details */}
      <div className="flex justify-between mb-4">
        <div>
          <p><strong>PO No:</strong> {props.poNo}</p>
          <p><strong>Date:</strong> {props.date}</p>
        </div>
        <div className="text-right">
          <p><strong>Supplier:</strong> {props.supplierName}</p>
          <p>{props.supplierAddress}</p>
          <p>{props.supplierState}</p>
          {props.supplierGstin && <p><strong>GSTIN:</strong> {props.supplierGstin}</p>}
          {props.supplierPhone && <p>Ph: {props.supplierPhone}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-black mb-4" style={{ fontSize: "10px" }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1 text-left">S.No</th>
            <th className="border border-black p-1 text-left">Product</th>
            <th className="border border-black p-1">HSN</th>
            <th className="border border-black p-1 text-left">Specification</th>
            <th className="border border-black p-1 text-right">Qty</th>
            <th className="border border-black p-1 text-right">Rate</th>
            <th className="border border-black p-1 text-right">Amount</th>
            <th className="border border-black p-1">GST%</th>
            <th className="border border-black p-1 text-right">Tax</th>
            <th className="border border-black p-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => {
            const amt = item.quantity * item.unitPrice;
            const tax = (amt * item.gstRate) / 100;
            return (
              <tr key={item.id}>
                <td className="border border-black p-1">{i + 1}</td>
                <td className="border border-black p-1">{item.product}</td>
                <td className="border border-black p-1 text-center">{item.hsn}</td>
                <td className="border border-black p-1">{item.specification}</td>
                <td className="border border-black p-1 text-right">{item.quantity}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(amt)}</td>
                <td className="border border-black p-1 text-center">{item.gstRate}%</td>
                <td className="border border-black p-1 text-right">{formatCurrency(tax)}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(amt + tax)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Tax Summary */}
      <div className="flex justify-between mb-4">
        <div>
          <p className="font-bold mb-1">{props.isInterState ? "IGST Breakdown" : "CGST/SGST Breakdown"}</p>
          <table className="border-collapse border border-black" style={{ fontSize: "10px" }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1">Rate</th>
                {props.isInterState ? (
                  <th className="border border-black p-1 text-right">IGST</th>
                ) : (
                  <>
                    <th className="border border-black p-1 text-right">CGST</th>
                    <th className="border border-black p-1 text-right">SGST</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {[5, 12, 18, 28].map(rate => {
                const b = props.calculations.gstBreakdown[rate];
                if (!b || b.taxable === 0) return null;
                return (
                  <tr key={rate}>
                    <td className="border border-black p-1">{rate}%</td>
                    {props.isInterState ? (
                      <td className="border border-black p-1 text-right">{formatCurrency(b.igst)}</td>
                    ) : (
                      <>
                        <td className="border border-black p-1 text-right">{formatCurrency(b.cgst)}</td>
                        <td className="border border-black p-1 text-right">{formatCurrency(b.sgst)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-right">
          <p>Subtotal: <strong>{formatCurrency(props.calculations.totalBeforeTax)}</strong></p>
          <p>Tax: <strong>{formatCurrency(props.calculations.totalTax)}</strong></p>
          <p className="text-sm font-bold mt-1">Grand Total: {formatCurrency(props.calculations.grandTotal)}</p>
          <p className="text-xs mt-1 italic">{numberToWords(props.calculations.grandTotal)}</p>
        </div>
      </div>

      {/* Shipping */}
      {props.shippingAddress && (
        <div className="mb-4">
          <p className="font-bold">Ship To:</p>
          <p>{props.shippingAddress}{props.shippingCity ? `, ${props.shippingCity}` : ""}</p>
          <p>{props.shippingState} {props.shippingPincode}</p>
        </div>
      )}

      {/* Terms */}
      <div className="mb-4 border-t border-black pt-2">
        <p className="font-bold">Terms:</p>
        <ul className="list-disc list-inside">
          <li>Delivery: {props.deliveryTimeline}</li>
          <li>{props.deliveryTerms}</li>
          <li>{props.paymentTerms}</li>
        </ul>
        {props.remarks && <p className="mt-1"><strong>Remarks:</strong> {props.remarks}</p>}
      </div>

      {/* Signatory */}
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
