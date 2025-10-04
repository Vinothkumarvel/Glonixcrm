"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PurchaseEntry } from "../../page";

export default function ViewGstPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<PurchaseEntry | null>(null);

  useEffect(() => {
    if (id) {
      const storedData = localStorage.getItem("gstPurchaseData") || "[]";
      const data: PurchaseEntry[] = JSON.parse(storedData);
      const itemToView = data.find((i) => i.id === id);
      if (itemToView) setItem(itemToView);
    }
  }, [id]);

  if (!item) return <div className="p-8">Record not found or loading...</div>;
  
  const formatCurrency = (value: number) => `₹${(value || 0).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl p-8 mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-green-700">GST Record Details</h1>
            <button onClick={() => router.push('/books/purchase/gst')} className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">Back to List</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Details Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-green-800 border-b pb-2">Purchase Info</h2>
                <DetailItem label="Vendor" value={item.vendor} />
                <DetailItem label="GST Number" value={item.gstNumber} />
                <DetailItem label="Deal Number" value={item.dealNumber} />
                <DetailItem label="Item" value={item.item} />
                <DetailItem label="HSN Code" value={item.hsnCode} />
                <DetailItem label="Invoice Date" value={item.invoiceDate} />

                <h2 className="text-lg font-semibold text-green-800 border-b pb-2 mt-6">Financials</h2>
                <DetailItem label="Quantity" value={item.quantity.toLocaleString('en-IN')} />
                <DetailItem label="Unit Price" value={formatCurrency(item.unitPriceINR)} />
                <DetailItem label="Total" value={formatCurrency(item.total)} />

                <h2 className="text-lg font-semibold text-green-800 border-b pb-2 mt-6">Payment Status</h2>
                 <DetailItem label="Payment Request" value={item.paymentRequest} />
                 <DetailItem label="Status" value={item.paymentStatus} />
                 <DetailItem label="Paid By" value={item.paidBy} />
                 <DetailItem label="Reference No" value={item.paymentReferenceNo || "-"} />
            </div>

            {/* PDF Viewer Section */}
            <div className="h-[75vh]">
                 <h2 className="text-lg font-semibold text-green-800 border-b pb-2 mb-4">Bill Preview</h2>
                {item.billUpload && item.billUpload.startsWith('data:application/pdf') ? (
                    <iframe src={item.billUpload} className="w-full h-full border rounded-md" title="Bill Preview" />
                ) : (
                    <div className="flex items-center justify-center w-full h-full border rounded-md bg-gray-50">
                        <p className="text-gray-500">No PDF available for preview.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div>
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <p className="mt-1 text-lg text-gray-900">{value}</p>
    </div>
);