"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/auth/tokenservice";
import { generatePDF } from "@/lib/pdf/pdfgenerator";

type Customer = {
  id: number;
  display_name: string;
  billing_attention?: string;
  billing_street1?: string;
  billing_street2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_pin_code?: string;
  billing_country?: string;
  billing_phone?: string;
  shipping_attention?: string;
  shipping_street1?: string;
  shipping_street2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pin_code?: string;
  shipping_country?: string;
  shipping_phone?: string;
};

type Item = {
  id: number;
  name: string;
  sales_selling_price: string; // stringified decimal from backend
};

type ProformaItemRow = {
  id: string;
  itemId: number | null;
  name: string;
  qty: number;
  rate: number;
};

export default function NewProformaInvoice() {
  const router = useRouter();

  // Customers fetched from API
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerFetchError, setCustomerFetchError] = useState("");

  // Items fetched from API
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("PI-" + (Math.floor(Date.now() / 1000) % 100000));
  const [reference, setReference] = useState("REF-" + (Math.floor(Date.now() / 1000) % 10000000));
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState("");
  const [salesperson, setSalesperson] = useState("");
  const [projectName, setProjectName] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("Looking forward to your business.");
  const [terms, setTerms] = useState("");

  const [proformaItems, setProformaItems] = useState<ProformaItemRow[]>([
    { id: crypto.randomUUID(), itemId: null, name: "", qty: 1, rate: 0 },
  ]);

  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [taxType, setTaxType] = useState<"TDS" | "TCS">("TDS");
  const [adjustment, setAdjustment] = useState(0);

  // Load customers
  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetchWithAuth("https://web-production-6baf3.up.railway.app/api/customers/");
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        setCustomers(data.results || []);
        setCustomerFetchError("");
      } catch (e) {
        setCustomerFetchError("Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    }
    loadCustomers();
  }, []);

  // Load items
  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetchWithAuth("https://web-production-6baf3.up.railway.app/api/items/");
        if (!res.ok) throw new Error("Failed to fetch items");
        const data = await res.json();
        setItemsList(data.results || []);
      } catch (e) {
        console.error("Failed to load items", e);
      } finally {
        setLoadingItems(false);
      }
    }
    loadItems();
  }, []);

  // Keep customerName synced with selectedCustomerId
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerName("");
    } else {
      const cust = customers.find(c => c.id === selectedCustomerId);
      setCustomerName(cust?.display_name ?? "");
    }
  }, [selectedCustomerId, customers]);

  function formatAddress(cust: Customer, type: "billing" | "shipping") {
    return [
      cust[`${type}_attention` as keyof Customer],
      cust[`${type}_street1` as keyof Customer],
      cust[`${type}_street2` as keyof Customer],
      `${cust[`${type}_city` as keyof Customer]}, ${cust[`${type}_state` as keyof Customer]} ${cust[`${type}_pin_code` as keyof Customer]}`,
      cust[`${type}_country` as keyof Customer],
      cust[`${type}_phone` as keyof Customer] ? `Phone: ${cust[`${type}_phone` as keyof Customer]}` : null,
    ].filter(Boolean).join("\n");
  }

  // Computed totals
  const subTotal = useMemo(
    () => proformaItems.reduce((sum, item) => sum + (item.qty * item.rate), 0),
    [proformaItems]
  );

  const discountAmount = useMemo(() => (subTotal * discountPct) / 100, [subTotal, discountPct]);

  const taxAmount = useMemo(() => {
    const base = (subTotal - discountAmount) * (taxPct / 100);
    return taxType === "TDS" ? -base : base;
  }, [subTotal, discountAmount, taxPct, taxType]);

  const total = useMemo(
    () => subTotal - discountAmount + taxAmount + adjustment,
    [subTotal, discountAmount, taxAmount, adjustment]
  );

  // Item row handlers
  const addRow = () => {
    setProformaItems(curr => [
      ...curr,
      { id: crypto.randomUUID(), itemId: null, name: "", qty: 1, rate: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    setProformaItems(curr => (curr.length > 1 ? curr.filter(row => row.id !== id) : curr));
  };

  const updateRow = (id: string, patch: Partial<ProformaItemRow>) => {
    setProformaItems(curr =>
      curr.map(row => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  // Save handler for proforma invoice
  const saveInvoice = async (saveStatus: "draft" | "sent") => {
  if (!selectedCustomerId) {
    alert("Please select a customer");
    return;
  }

  const payload = {
    customer_id: selectedCustomerId,
    invoice_number: invoiceNumber,
    reference_number: reference,
    invoice_date: invoiceDate,
    expiry_date: expiryDate,
    salesperson,
    project_name: projectName,
    subject,
    customer_notes: notes,
    terms_and_conditions: terms,
    subtotal: subTotal.toFixed(2),
    discount: discountPct.toFixed(2),
    tax_type: taxType,
    tax_percentage: taxPct.toString(),
    adjustment: adjustment.toFixed(2),
    total_amount: total.toFixed(2),
    status: saveStatus,
    item_details: proformaItems
      .filter(item => item.itemId !== null)
      .map(item => ({
        item_id: item.itemId,
        quantity: item.qty,
        rate: item.rate,
        amount: (item.qty * item.rate).toFixed(2),
      })),
  };

  try {
    const res = await fetchWithAuth(
      "https://web-production-6baf3.up.railway.app/api/proformainvoices/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      alert(`Failed to save proforma invoice: ${JSON.stringify(err)}`);
      return;
    }

    if (saveStatus === "sent") {
      const customerObj = customers.find((c) => c.id === selectedCustomerId);
      const billTo = customerObj ? formatAddress(customerObj, "billing") : "";
      const shipTo = customerObj ? formatAddress(customerObj, "shipping") : "";

      generatePDF({
        title: "PROFORMA",
        documentNumber: invoiceNumber,
        documentDate: invoiceDate,
        expiryDate,
        customerName,
        billTo,
        shipTo,
        placeOfSupply: "",
        items: proformaItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          rate: item.rate,
          sales_description: "",
        })),
        subTotal,
        taxBreakup: [{ label: taxType, pct: taxPct, amount: taxAmount }],
        total,
        totalInWords: `Indian Rupees ${total.toFixed(2)} Only`,
        notes,
        terms,
        logo: "", // Provide logo base64 if available
      });
    }

    router.push("/books/sales/proforma-invoice");
  } catch (err) {
    alert("Error saving proforma invoice.");
    console.error(err);
  }
};


  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-3xl mb-6 text-green-800 font-semibold">
        New Proforma Invoice
      </h1>
      <div className="bg-white p-6 rounded-xl shadow max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-green-700 mb-1">
              Customer
            </label>
            {loadingCustomers ? (
              <p>Loading customers...</p>
            ) : customerFetchError ? (
              <p className="text-red-600">{customerFetchError}</p>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={e =>
                  setSelectedCustomerId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full border border-green-300 rounded px-3 py-2"
              >
                <option value="">Select customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block font-medium text-green-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              className="w-full border border-green-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block font-medium text-green-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full border border-green-300 rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-green-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full border border-green-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium text-green-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full border border-green-300 rounded px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-green-700 mb-1">
              Salesperson
            </label>
            <input
              type="text"
              value={salesperson}
              onChange={e => setSalesperson(e.target.value)}
              className="w-full border border-green-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium text-green-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full border border-green-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-medium text-green-700 mb-1">
            Subject
          </label>
          <textarea
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full border border-green-300 rounded px-3 py-2"
          />
        </div>

        {/* Items table */}
        <div className="overflow-hidden border rounded-xl mt-6">
          <table className="w-full">
            <thead className="text-green-900 bg-green-100">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Rate</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {proformaItems.map(item => (
                <tr key={item.id} className="bg-green-50">
                  <td className="p-2">
                    <select
                      className="w-full border border-green-300 rounded px-2 py-1"
                      value={item.itemId ?? ""}
                      onChange={e => {
                        const id = Number(e.target.value);
                        const selectedItem = itemsList.find(i => i.id === id);
                        updateRow(item.id, {
                          itemId: id,
                          name: selectedItem?.name ?? "",
                          rate: selectedItem ? Number(selectedItem.sales_selling_price) : 0,
                        });
                      }}
                    >
                      <option value="">Select item</option>
                      {itemsList.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={item.qty}
                      onChange={e => updateRow(item.id, { qty: Number(e.target.value) })}
                      className="w-20 border border-green-300 rounded px-3 py-2"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.rate}
                      readOnly
                      className="w-24 border border-green-300 rounded px-3 py-2"
                    />
                  </td>
                  <td className="p-2 text-right font-semibold">
                    {(item.qty * item.rate).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeRow(item.id)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addRow}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Item
          </button>
        </div>

        {/* Totals and footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block font-semibold text-green-700 mb-1">
              Customer Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-green-300 rounded px-3 py-2"
              placeholder="Notes for customer"
            />
          </div>
          <div className="p-6 bg-green-50 rounded border border-green-200 space-y-3">
            <div className="flex justify-between">
              Subtotal <span>₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Discount %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={discountPct}
                onChange={e => setDiscountPct(Number(e.target.value))}
                className="w-20 border border-green-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    checked={taxType === "TDS"}
                    onChange={() => setTaxType("TDS")}
                  />{" "}
                  TDS
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    checked={taxType === "TCS"}
                    onChange={() => setTaxType("TCS")}
                  />{" "}
                  TCS
                </label>
              </div>
              <select
                value={taxPct}
                onChange={e => setTaxPct(Number(e.target.value))}
                className="border border-green-300 rounded px-3 py-2"
              >
                {[0, 5, 12, 18, 28].map(t => (
                  <option key={t} value={t}>
                    {t}%
                  </option>
                ))}
              </select>
              <div>
                {taxType === "TDS" ? "-" : "+"} ₹{Math.abs(taxAmount).toFixed(2)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Adjustment</span>
              <input
                type="number"
                value={adjustment}
                onChange={e => setAdjustment(Number(e.target.value))}
                className="w-24 border border-green-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-between border-t border-green-300 pt-2 font-semibold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6">
          <label className="block font-semibold text-green-700 mb-1">
            Terms &amp; Conditions
          </label>
          <textarea
            value={terms}
            onChange={e => setTerms(e.target.value)}
            className="w-full border border-green-300 rounded px-3 py-2"
            placeholder="Terms & Conditions"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex mt-5 flex-wrap justify-end gap-3">
          <button
            onClick={() => saveInvoice("draft")}
            className="px-4 py-2 border rounded-lg hover:bg-green-100"
          >
            Save as Draft
          </button>
          <button
            onClick={() => saveInvoice("sent")}
            className="px-4 py-2 text-white bg-green-600 rounded-lg shadow hover:bg-green-700"
          >
            Save and Send
          </button>
          <button
            onClick={() => router.push("/books/sales/proforma-invoice")}
            className="px-4 py-2 border rounded-lg hover:bg-red-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

