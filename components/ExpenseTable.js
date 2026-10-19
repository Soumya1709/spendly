"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Download, Search } from "lucide-react";
import { CATEGORIES, inr, formatDate } from "@/lib/constants";

const SORTS = {
  "date-desc": (a, b) => b.date.localeCompare(a.date),
  "date-asc": (a, b) => a.date.localeCompare(b.date),
  "amount-desc": (a, b) => b.amount - a.amount,
  "amount-asc": (a, b) => a.amount - b.amount,
};

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("date-desc");

  const visible = useMemo(
    () =>
      expenses
        .filter((e) => category === "All" || e.category === category)
        .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
        .sort(SORTS[sort]),
    [expenses, query, category, sort]
  );

  const exportCsv = () => {
    const rows = [
      ["Date", "Name", "Category", "Amount"],
      ...visible.map((e) => [e.date, e.name, e.category, e.amount]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const control =
    "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-500";

  return (
    <section className="mt-6 rounded-2xl bg-zinc-900 p-4 shadow-md md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-xl font-bold">Transactions</h2>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
          <input
            className={`${control} pl-8`}
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select className={control} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          {Object.keys(CATEGORIES).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select className={control} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>

        <button
          onClick={exportCsv}
          disabled={visible.length === 0}
          className={`${control} flex items-center gap-2 hover:bg-zinc-700 disabled:opacity-40`}
        >
          <Download size={14} /> CSV
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-zinc-500">
          {expenses.length === 0 ? "No expenses yet. Add your first one above." : "No matches."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-zinc-800">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 text-right font-medium">Amount</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40">
                  <td className="whitespace-nowrap py-3 pr-4 text-zinc-400">{formatDate(e.date)}</td>
                  <td className="py-3 pr-4">{e.name}</td>
                  <td className="py-3 pr-4">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
                      style={{ background: CATEGORIES[e.category] }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold">{inr(e.amount)}</td>
                  <td className="whitespace-nowrap py-3 text-right">
                    <button onClick={() => onEdit(e)} className="p-1.5 text-zinc-400 hover:text-white" aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(e.id)} className="p-1.5 text-zinc-400 hover:text-red-400" aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}