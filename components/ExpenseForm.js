"use client";

import { useState, useEffect } from "react";
import { CATEGORIES, today } from "@/lib/constants";

const blank = () => ({ name: "", amount: "", category: "Food", date: today() });

const field =
  "w-full rounded-lg bg-white/95 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-300";

export default function ExpenseForm({ onSave, editing, onCancel }) {
  const [f, setF] = useState(blank);
  const [error, setError] = useState("");

  // Fill the form when "Edit" is clicked, reset when editing ends
  useEffect(() => {
    setF(
      editing
        ? {
            name: editing.name,
            amount: String(editing.amount),
            category: editing.category,
            date: editing.date,
          }
        : blank()
    );
    setError("");
  }, [editing]);

  const set = (key) => (e) => setF((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(f.amount);
    if (!f.name.trim() || isNaN(amount) || amount <= 0 || !f.date) {
      setError("Add a name, a positive amount and a date.");
      return;
    }
    onSave({ name: f.name.trim(), amount, category: f.category, date: f.date });
    setF(blank()); // clear inputs after a successful submit
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col justify-center gap-2">
      <p className="font-medium">{editing ? "Edit expense" : "Add expense"}</p>
      <input className={field} placeholder="Expense name" value={f.name} onChange={set("name")} />
      <div className="grid grid-cols-2 gap-2">
        <input
          className={field}
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={f.amount}
          onChange={set("amount")}
        />
        <select className={field} value={f.category} onChange={set("category")}>
          {Object.keys(CATEGORIES).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className={field} type="date" value={f.date} onChange={set("date")} />
        <button
          type="submit"
          className="rounded-lg bg-yellow-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-200"
        >
          {editing ? "Save" : "Add"}
        </button>
      </div>
      {editing && (
        <button type="button" onClick={onCancel} className="text-xs underline">
          Cancel editing
        </button>
      )}
      {error && <p className="text-xs text-yellow-200">{error}</p>}
    </form>
  );
}