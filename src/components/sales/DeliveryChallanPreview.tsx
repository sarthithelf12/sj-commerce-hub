import { COMPANY_INFO } from "@/config/companyInfo";

interface LineItem {
  id: string;
  product: string;
  hsn: string;
  specification: string;
  quantity: number;
  unit: string;
}

interface DeliveryChallanPreviewProps {
  challanNo: string;
  date: string;
  challanType: string;
  invoiceRef: string;
  customerName: string;
  customerAddress: string;
  customerState: string;
  customerGstin: string;
  shippingName: string;
  shippingAddress: string;
  shippingState: string;
  shippingPincode: string;
  transporterName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  ewayBillNo: string;
  items: LineItem[];
  remarks: string;
}

export const DeliveryChallanPreview = (props: DeliveryChallanPreviewProps) => {
  return (
    <div className="font-sans text-xs leading-relaxed" style={{ color: "#000" }}>
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-xl font-bold">{COMPANY_INFO.name}</h1>
        <p className="text-xs">{COMPANY_INFO.address}</p>
        <p className="text-xs">GSTIN: {COMPANY_INFO.gstin}</p>
        <p className="text-xs">Phone: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email}</p>
        <h2 className="text-base font-bold mt-3 underline">DELIVERY CHALLAN</h2>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p><strong>Challan No:</strong> {props.challanNo}</p>
          <p><strong>Date:</strong> {props.date}</p>
          {props.challanType && <p><strong>Type:</strong> {props.challanType}</p>}
          {props.invoiceRef && <p><strong>Invoice Ref:</strong> {props.invoiceRef}</p>}
        </div>
        <div className="text-right">
          <p><strong>Consignee:</strong> {props.customerName}</p>
          <p>{props.customerAddress}</p>
          <p>{props.customerState}</p>
          {props.customerGstin && <p><strong>GSTIN:</strong> {props.customerGstin}</p>}
        </div>
      </div>

      {props.shippingName && (
        <div className="mb-4 p-2 border border-black">
          <p className="font-bold">Ship To:</p>
          <p>{props.shippingName}, {props.shippingAddress}, {props.shippingState} {props.shippingPincode}</p>
        </div>
      )}

      {(props.transporterName || props.vehicleNo) && (
        <div className="mb-4 p-2 border border-black">
          <p className="font-bold">Transport Details:</p>
          <div className="grid grid-cols-2 gap-1">
            {props.transporterName && <p>Transporter: {props.transporterName}</p>}
            {props.vehicleNo && <p>Vehicle: {props.vehicleNo}</p>}
            {props.driverName && <p>Driver: {props.driverName}</p>}
            {props.driverPhone && <p>Phone: {props.driverPhone}</p>}
            {props.ewayBillNo && <p>E-Way Bill: {props.ewayBillNo}</p>}
          </div>
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
            <th className="border border-black p-1">Unit</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={item.id}>
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{item.product}</td>
              <td className="border border-black p-1 text-center">{item.hsn}</td>
              <td className="border border-black p-1">{item.specification}</td>
              <td className="border border-black p-1 text-right">{item.quantity}</td>
              <td className="border border-black p-1 text-center">{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {props.remarks && (
        <div className="mb-4">
          <p><strong>Remarks:</strong> {props.remarks}</p>
        </div>
      )}

      <div className="flex justify-between items-end mt-12">
        <div className="text-center">
          <p className="text-xs">Received in good condition</p>
          <div className="h-16"></div>
          <p className="border-t border-black pt-1 px-8 text-xs">Receiver's Signature & Stamp</p>
        </div>
        <div className="text-center">
          <p className="text-xs">For {COMPANY_INFO.name}</p>
          <div className="h-16"></div>
          <p className="border-t border-black pt-1 px-8 text-xs">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
};
