"use client";

import { useState, FC } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { PurchaseEntry } from "../page";

// Reusable Components (co-located for simplicity)
const InputField: FC<any> = ({ label, name, type = "text", value, onChange, required = false, readOnly = false }) => (
    <div>
      <label className="block text-sm font-medium text-green-800">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} className={`w-full p-2 mt-1 border rounded-md ${readOnly ? "bg-gray-100" : ""}`} />
    </div>
);
const SelectField: FC<any> = ({ label, name, value, onChange, options, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-green-800">{label} {required && <span className="text-red-500">*</span>}</label>
      <select name={name} value={value} onChange={onChange} required={required} className="w-full p-2 mt-1 border rounded-md">
        {options.map((opt: string) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
);

export default function NewGstPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<Omit<PurchaseEntry, 'id' | 'total'>>({
        vendor: "", gstNumber: "", dealNumber: "", item: "", description: "", itemSpecification: "", hsnCode: "",
        brand: "", quantity: 0, unitPriceINR: 0, invoiceDate: "", billUpload: "",
        paymentRequest: "Low", paymentStatus: "Unpaid", paymentReferenceNo: "", paidBy: "N/A",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumeric = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumeric ? (value === '' ? '' : Number(value)) : value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024) {
            alert("Please upload a PDF file under 5MB.");
            e.target.value = ''; // Reset file input
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setFormData(prev => ({ ...prev, billUpload: reader.result as string }));
        reader.onerror = (error) => console.error("File reading error:", error);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.billUpload) {
            alert("A bill upload (PDF) is required.");
            return;
        }
        const total = (formData.quantity || 0) * (formData.unitPriceINR || 0);
        const finalEntry: PurchaseEntry = { ...formData, id: uuidv4(), total, quantity: Number(formData.quantity), unitPriceINR: Number(formData.unitPriceINR) };
        
        const storedData = localStorage.getItem("gstPurchaseData") || "[]";
        const data: PurchaseEntry[] = JSON.parse(storedData);
        data.push(finalEntry);
        localStorage.setItem("gstPurchaseData", JSON.stringify(data));
        
        router.push("/books/purchase/gst");
    };
    
    return (
        <div className="min-h-screen p-8 bg-white">
            <h1 className="mb-6 text-2xl font-bold text-green-700">Add New GST Record</h1>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 rounded shadow bg-green-50">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Form fields identical to original component */}
                     <InputField label="Vendor" name="vendor" value={formData.vendor} onChange={handleChange} required />
                     <InputField label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} required />
                     <InputField label="Deal Number" name="dealNumber" value={formData.dealNumber} onChange={handleChange} required />
                     {/* ... Add all other InputField and SelectField components from your original form here ... */}
                     <InputField label="Quantity/PCS" name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
                     <InputField label="Unit Price (INR)" name="unitPriceINR" type="number" value={formData.unitPriceINR} onChange={handleChange} required />
                     <div>
                         <label className="block text-sm font-medium text-green-800">Total (INR)</label>
                         <div className="mt-1 p-2 bg-gray-100 rounded-md">{(Number(formData.quantity) * Number(formData.unitPriceINR)).toLocaleString("en-IN")}</div>
                     </div>
                      <InputField label="Invoice Date" name="invoiceDate" type="date" value={formData.invoiceDate} onChange={handleChange} required />
                     <div>
                         <label className="block text-sm font-medium text-green-800">Bill Upload (PDF) <span className="text-red-500">*</span></label>
                         <input type="file" name="billUpload" onChange={handleFileChange} accept=".pdf" className="w-full p-1.5 mt-1 border rounded-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                     </div>
                     <SelectField label="Payment Request" name="paymentRequest" value={formData.paymentRequest} onChange={handleChange} options={["Low", "High"]} />
                     <SelectField label="Payment Status" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} options={["Unpaid", "Partially paid", "Paid"]} />
                     <InputField label="Payment Reference No" name="paymentReferenceNo" value={formData.paymentReferenceNo} onChange={handleChange} />
                     <SelectField label="Paid By" name="paidBy" value={formData.paidBy} onChange={handleChange} options={["N/A", "SBI", "ICICI", "IOB", "Petty Cash"]} />
                 </div>
                 <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => router.push('/books/purchase/gst')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">Save</button>
                 </div>
            </form>
        </div>
    );
}