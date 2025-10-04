"use client";

import { useState, useEffect, FC } from "react";
import { useRouter, useParams } from "next/navigation";
import { PurchaseEntry } from "../../page";

// Reusable Components
const InputField: FC<any> = ({ label, name, type = "text", value, onChange, required = false, readOnly = false }) => ( /* ... same as new page ... */ );
const SelectField: FC<any> = ({ label, name, value, onChange, options, required = false }) => ( /* ... same as new page ... */ );

export default function EditGstPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [formData, setFormData] = useState<PurchaseEntry | null>(null);

    useEffect(() => {
        if (id) {
            const storedData = localStorage.getItem("gstPurchaseData") || "[]";
            const data: PurchaseEntry[] = JSON.parse(storedData);
            const itemToEdit = data.find(item => item.id === id);
            if (itemToEdit) setFormData(itemToEdit);
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const isNumeric = type === 'number';
        setFormData({ ...formData, [name]: isNumeric ? (value === '' ? 0 : Number(value)) : value });
    };

     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        // ... same file handling logic as new page
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        const total = (formData.quantity || 0) * (formData.unitPriceINR || 0);
        const updatedEntry = { ...formData, total };
        
        const storedData = localStorage.getItem("gstPurchaseData") || "[]";
        const data: PurchaseEntry[] = JSON.parse(storedData);
        const updatedData = data.map(item => item.id === id ? updatedEntry : item);
        localStorage.setItem("gstPurchaseData", JSON.stringify(updatedData));
        
        router.push("/books/purchase/gst");
    };

    if (!formData) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen p-8 bg-white">
            <h1 className="mb-6 text-2xl font-bold text-green-700">Edit GST Record</h1>
             {/* The Form JSX is identical to the New Page, just passing `formData` */}
             <form onSubmit={handleSubmit} className="p-8 space-y-6 rounded shadow bg-green-50">
                 {/* ... Form fields ... */}
                 <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => router.push('/books/purchase/gst')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">Update</button>
                 </div>
            </form>
        </div>
    );
}