
"use client";

import { useState } from "react";
import { X, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const categories = {
  Expense: [
    "Food & Dining",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other",
  ],
  Income: [
    "Salary",
    "Freelance",
    "Investments",
    "Business",
    "Gift",
    "Other",
  ],
};

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
}) {
  const [type, setType] = useState("Expense");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food & Dining",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "UPI",
    notes: "",
  });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setType(newType);
    setForm((prev) => ({
      ...prev,
      category: categories[newType][0],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim()) {
      setError("Please enter a transaction title.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    onAddTransaction({
      id: crypto.randomUUID(),
      title: form.title.trim(),
      amount,
      type,
      category: form.category,
      date: form.date,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
    });

    setForm({
      title: "",
      amount: "",
      category: categories[type][0],
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "UPI",
      notes: "",
    });

    setError("");
    onClose();
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="transaction-modal-title"
              className="text-xl font-bold text-gray-900"
            >
              Add Transaction
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Record your income or expenses.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange("Expense")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              type === "Expense"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ArrowUpRight size={18} />
            Expense
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("Income")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              type === "Income"
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ArrowDownLeft size={18} />
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Transaction title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping"
              className={inputClass}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                {categories[type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Payment method
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className={inputClass}
            >
              <option>UPI</option>
              <option>Cash</option>
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add a note..."
              rows={2}
              maxLength={500}
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
