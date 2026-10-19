"use client";

import { useState, useRef, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { monthKey, monthLabel, today } from "@/lib/constants";
import Dashboard from "@/components/Dashboard";
import ExpenseTable from "@/components/ExpenseTable";

// Old entries (from v1) had no date. Give them today's date and make sure amounts are numbers.
const migrateExpenses = (list) =>
  Array.isArray(list)
    ? list.map((e) => ({
        ...e,
        id: e.id ?? crypto.randomUUID(),
        amount: Number(e.amount) || 0,
        date: e.date || today(),
      }))
    : [];

export default function Home() {
  const [expenses, setExpenses, loaded] = useLocalStorage("expenses", [], migrateExpenses);
  const [budget, setBudget] = useLocalStorage("budget", 20000);
  const [period, setPeriod] = useState("all");
  const [editing, setEditing] = useState(null);
  const [deleted, setDeleted] = useState(null); // last deleted expense, for undo
  const timer = useRef(null);

  const months = useMemo(
    () => [...new Set(expenses.map((e) => monthKey(e.date)))].sort().reverse(),
    [expenses]
  );

  const scoped = useMemo(
    () =>
      period === "all"
        ? expenses
        : expenses.filter((e) => monthKey(e.date) === period),
    [expenses, period]
  );

  const thisMonth = useMemo(
    () =>
      expenses
        .filter((e) => monthKey(e.date) === monthKey(today()))
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const saveExpense = (data) => {
    if (editing) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === editing.id ? { ...e, ...data } : e))
      );
      setEditing(null);
    } else {
      setExpenses((prev) => [{ id: crypto.randomUUID(), ...data }, ...prev]);
    }
  };

  const deleteExpense = (id) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (editing?.id === id) setEditing(null);
    setDeleted(target);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDeleted(null), 5000);
  };

  const undoDelete = () => {
    setExpenses((prev) => [deleted, ...prev]);
    setDeleted(null);
  };

  // Render nothing until localStorage is read. This avoids a flash of empty data
  // and lets Dashboard safely read its saved layout on first render.
  if (!loaded) {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Expense Tracker</h1>
            <p className="text-sm text-zinc-400">
              Drag the grip icon on any card to rearrange your dashboard.
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          >
            <option value="all">All time</option>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </header>

        <div className="mt-6">
          <Dashboard
            expenses={scoped}
            thisMonth={thisMonth}
            budget={budget}
            setBudget={setBudget}
            onSave={saveExpense}
            editing={editing}
            onCancelEdit={() => setEditing(null)}
          />
        </div>

        <ExpenseTable
          expenses={scoped}
          onEdit={(e) => {
            setEditing(e);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={deleteExpense}
        />
      </div>

      {deleted && (
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-900 shadow-xl">
          <span>Deleted “{deleted.name}”</span>
          <button onClick={undoDelete} className="font-semibold text-blue-600">
            Undo
          </button>
        </div>
      )}
    </main>
  );
}