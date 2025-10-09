"use client";

import { useState } from "react";

// Define a type for the form data for type safety
type ContactFormData = {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    company: string;
    mobile: string;
    description: string;
    mailingStreet: string;
    mailingCity: string;
    mailingState: string;
    mailingCountry: string;
    mailingZip: string;
};

// Define types for the component's props
type AddContactModalProps = {
    onClose: () => void;
    onSave: (data: ContactFormData) => void;
};

export default function AddContactModal({ onClose, onSave }: AddContactModalProps) {
    const [formData, setFormData] = useState<ContactFormData>({
        firstName: "",
        lastName: "",
        title: "",
        email: "",
        company: "",
        mobile: "",
        description: "",
        mailingStreet: "",
        mailingCity: "",
        mailingState: "",
        mailingCountry: "",
        mailingZip: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        onSave(formData);
    };

    // Helper to create a type-safe array for mapping form fields
    const contactFields: { label: string; name: keyof ContactFormData }[] = [
        { label: "First Name", name: "firstName" },
        { label: "Last Name", name: "lastName" },
        { label: "Title", name: "title" },
        { label: "Email", name: "email" },
        { label: "Company Name", name: "company" },
        { label: "Mobile", name: "mobile" },
        { label: "Description", name: "description" },
    ];

    const addressFields: { label: string; name: keyof ContactFormData }[] = [
        { label: "Mailing Street", name: "mailingStreet" },
        { label: "Mailing City", name: "mailingCity" },
        { label: "Mailing State", name: "mailingState" },
        { label: "Mailing Country", name: "mailingCountry" },
        { label: "Mailing Zip", name: "mailingZip" },
    ];

    return (
        <div className="fixed inset-0 flex justify-end bg-black bg-opacity-40 z-50">
            {/* Side Drawer */}
            <div className="w-full sm:w-[500px] bg-white shadow-xl h-full flex flex-col animate-slide-in">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Add Contact</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                        <div className="space-y-4">
                            {contactFields.map(({ label, name }) => (
                                <div key={name} className="flex items-center">
                                    <label className="w-40 text-gray-700">{label}</label>
                                    <input
                                        type="text"
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Address Details */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Address Details</h3>
                        <div className="space-y-4">
                            {addressFields.map(({ label, name }) => (
                                <div key={name} className="flex items-center">
                                    <label className="w-40 text-gray-700">{label}</label>
                                    <input
                                        type="text"
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-2xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded-2xl bg-green-600 text-white hover:bg-green-700"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Animation */}
            <style jsx>{`
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out forwards;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0%);
                    }
                }
            `}</style>
        </div>
    );
}
