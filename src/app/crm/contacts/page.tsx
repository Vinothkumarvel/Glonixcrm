"use client";

import { useState } from "react";
import ContactsToolbar from "../components/ContactsToolbar";
import ContactsTable from "../components/ContactsTable";
import AddContactModal from "../components/AddContactModal";

// Type for the contact data used within this page's state
type Contact = {
  name: string;
  company: string;
  email: string;
  phone: string;
  owner: string;
};

// Type for the data received from the AddContactModal
type NewContactData = {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    mobile: string;
    // ... other fields from the modal form can be added here if needed
};


export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      name: "Ted Watson",
      company: "Zylker Corp",
      email: "support@bigin.com",
      phone: "",
      owner: "hemanthtech",
    },
  ]);

  const [isModalOpen, setModalOpen] = useState(false);

  const handleAddContact = (data: NewContactData) => {
    const newContact: Contact = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        company: data.company,
        email: data.email,
        phone: data.mobile,
        owner: "hemanthtech", // Assuming a default owner for now
    };
    setContacts([...contacts, newContact]);
    setModalOpen(false);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg h-full flex flex-col">
      {/* Toolbar */}
      <ContactsToolbar onAddContact={() => setModalOpen(true)} />

      {/* Table */}
      <div className="mt-4 flex-1 overflow-auto">
        <ContactsTable contacts={contacts} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddContactModal
          onClose={() => setModalOpen(false)}
          onSave={handleAddContact}
        />
      )}
    </div>
  );
}
