
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Wallet,
  Target,
  TrendingUp,
  TrendingDown,
  Trash2,
  Pencil,
  X,
  PiggyBank,
  Utensils,
  ShoppingBag,
  Car,
  Clapperboard,
  Receipt,
  HeartPulse,
  GraduationCap,
  Plane,
  MoreHorizontal,
} from "lucide-react";

import AppLayout from "@/components/AppLayout";
import { useTransactions } from "@/components/TransactionProvider";

const BUDGETS_KEY = "spendly_budgets";

const categories = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

const categoryConfig = {
  "Food & Dining": {
    icon: Utensils,
    color: "#10b981",
    background: "bg-emerald-50",
    text: "text-emerald-600",
  },
  Shopping: {
    icon: ShoppingBag,
    color: "#6366f1",
    background: "bg-indigo-50",
    text: "text-indigo-600",
  },
  Transportation: {
    icon: Car,
    color: "#f59e0b",
    background: "bg-amber-50",
    text: "text-amber-600",
  },
  Entertainment: {
    icon: Clapperboard,
    color: "#ec4899",
    background: "bg-pink-50",
    text: "text-pink-600",
  },
  "Bills & Utilities": {
    icon: Receipt,
    color: "#8b5cf6",
    background: "bg-violet-50",
    text: "text-violet-600",
  },
  Healthcare: {
    icon: HeartPulse,
    color: "#ef4444",
    background: "bg-rose-50",
    text: "text-rose-600",
  },
  Education: {
    icon: GraduationCap,
    color: "#0ea5e9",
    background: "bg-sky-50",
    text: "text-sky-600",
  },
  Travel: {
    icon: Plane,
    color: "#14b8a6",
    background: "bg-teal-50",
    text: "text-teal-600",
  },
  Other: {
    icon: MoreHorizontal,
    color: "#94a3b8",
    background: "bg-gray-100",
    text: "text-gray-600",
  },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getCurrentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoaded, setBudgetsLoaded] = useState(false);
  const { transactions, isLoaded: transactionsLoaded } = useTransactions();
  const isLoaded = budgetsLoaded && transactionsLoaded;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [form, setForm] = useState({
    category: categories[0],
    limit: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedBudgets = localStorage.getItem(BUDGETS_KEY);

      if (savedBudgets !== null) {
        const parsedBudgets = JSON.parse(savedBudgets);

        if (Array.isArray(parsedBudgets)) {
          setBudgets(parsedBudgets);
        }
      }

    } catch (err) {
      console.error("Unable to load budget data:", err);
    } finally {
      setBudgetsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch (err) {
      console.error("Unable to save budgets:", err);
    }
  }, [budgets, isLoaded]);

  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }, [selectedMonth]);

  const monthBudgets = useMemo(() => {
    return budgets.filter((budget) => budget.month === selectedMonth);
  }, [budgets, selectedMonth]);

  const budgetDetails = useMemo(() => {
    return monthBudgets.map((budget) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.type === "Expense" &&
            transaction.category === budget.category &&
            transaction.date?.startsWith(selectedMonth)
        )
        .reduce(
          (sum, transaction) => sum + Number(transaction.amount || 0),
          0
        );

      const limit = Number(budget.limit) || 0;
      const remaining = limit - spent;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      return {
        ...budget,
        spent,
        remaining,
        percentage,
        exceeded: spent > limit,
      };
    });
  }, [monthBudgets, transactions, selectedMonth]);

  const summary = useMemo(() => {
    const totalBudget = budgetDetails.reduce(
      (sum, budget) => sum + Number(budget.limit),
      0
    );

    const totalSpent = budgetDetails.reduce(
      (sum, budget) => sum + budget.spent,
      0
    );

    const totalRemaining = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      percentage:
        totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      exceededCount: budgetDetails.filter((budget) => budget.exceeded).length,
    };
  }, [budgetDetails]);

  const openAddForm = () => {
    setEditingId(null);

    const availableCategory =
      categories.find(
        (category) =>
          !monthBudgets.some((budget) => budget.category === category)
      ) || categories[0];

    setForm({
      category: availableCategory,
      limit: "",
    });

    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (budget) => {
    setEditingId(budget.id);

    setForm({
      category: budget.category,
      limit: String(budget.limit),
    });

    setError("");
    setIsFormOpen(true);
  };

  const handleSaveBudget = (event) => {
    event.preventDefault();

    const limit = Number(form.limit);

    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Please enter a monthly limit greater than zero.");
      return;
    }

    const duplicate = budgets.some(
      (budget) =>
        budget.month === selectedMonth &&
        budget.category === form.category &&
        budget.id !== editingId
    );

    if (duplicate) {
      setError("A budget already exists for this category and month.");
      return;
    }

    if (editingId) {
      setBudgets((previous) =>
        previous.map((budget) =>
          budget.id === editingId
            ? {
                ...budget,
                category: form.category,
                limit,
              }
            : budget
        )
      );
    } else {
      setBudgets((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          category: form.category,
          limit,
          month: selectedMonth,
        },
      ]);
    }

    setIsFormOpen(false);
    setEditingId(null);
    setError("");
  };

  const handleDeleteBudget = (id) => {
    const confirmed = window.confirm(
      "Delete this budget? Your transactions will not be deleted."
    );

    if (!confirmed) return;

    setBudgets((previous) =>
      previous.filter((budget) => budget.id !== id)
    );
  };

  const changeMonth = (direction) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction, 1);

    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`
    );
  };

  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-7">
          {/* Heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Plan smarter, spend better
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Budgets
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Set spending limits and stay in control of your money.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              disabled={!isLoaded || monthBudgets.length >= categories.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />
              Create Budget
            </button>
          </div>

          {/* Month selector */}
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <Target size={21} className="text-emerald-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Monthly budget plan
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Review your budgets for {monthLabel}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition hover:bg-gray-50"
              >
                ←
              </button>

              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                aria-label="Select budget month"
                className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </section>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Budget"
              amount={summary.totalBudget}
              icon={Wallet}
              iconStyle="bg-blue-50 text-blue-600"
              description={`${monthBudgets.length} categories budgeted`}
            />

            <SummaryCard
              title="Total Spent"
              amount={summary.totalSpent}
              icon={TrendingDown}
              iconStyle="bg-rose-50 text-rose-600"
              description={`${Math.round(summary.percentage)}% of budget`}
            />

            <SummaryCard
              title="Remaining"
              amount={summary.totalRemaining}
              icon={PiggyBank}
              iconStyle="bg-emerald-50 text-emerald-600"
              description={
                summary.totalRemaining < 0
                  ? "Over your combined limits"
                  : "Available within your limits"
              }
            />

            <SummaryCard
              title="Budgets Exceeded"
              amount={summary.exceededCount}
              icon={TrendingUp}
              iconStyle="bg-amber-50 text-amber-600"
              isCount
              description="Categories over their limit"
            />
          </div>

          {/* Overall progress */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Overall spending progress
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Total expenses compared with your combined budget limits.
                </p>
              </div>

              <p className="text-xl font-bold text-gray-900">
                {Math.round(summary.percentage)}%
              </p>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  summary.percentage > 100
                    ? "bg-rose-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(summary.percentage, 100)}%`,
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-gray-500">
                Spent: {formatCurrency(summary.totalSpent)}
              </span>

              <span className="text-gray-500">
                Budget: {formatCurrency(summary.totalBudget)}
              </span>
            </div>
          </section>

          {/* Budget cards */}
          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Category budgets
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your spending limits for {monthLabel}.
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                {monthBudgets.length} budgets
              </span>
            </div>

            {!isLoaded ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500">
                Loading your budgets...
              </div>
            ) : budgetDetails.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <Target size={28} className="text-emerald-600" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  Start planning your spending
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Create your first category budget to track expenses and
                  understand how much money you have left to spend.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Plus size={18} />
                  Create your first budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {budgetDetails.map((budget) => {
                  const config =
                    categoryConfig[budget.category] || categoryConfig.Other;

                  const Icon = config.icon;
                  const percentage = Math.round(budget.percentage);
                  const progressWidth = Math.min(budget.percentage, 100);

                  return (
                    <article
                      key={budget.id}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl p-3 ${config.background}`}>
                            <Icon size={21} className={config.text} />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-gray-900">
                              {budget.category}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                              Monthly limit
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(budget)}
                            aria-label={`Edit ${budget.category} budget`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBudget(budget.id)}
                            aria-label={`Delete ${budget.category} budget`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-7 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Spent so far</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatCurrency(budget.spent)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            budget.exceeded
                              ? "bg-rose-50 text-rose-600"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {percentage}% used
                        </span>
                      </div>

                      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progressWidth}%`,
                            backgroundColor: budget.exceeded
                              ? "#ef4444"
                              : config.color,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                        <span className="text-gray-500">
                          Limit: {formatCurrency(budget.limit)}
                        </span>

                        <span
                          className={`font-semibold ${
                            budget.exceeded
                              ? "text-rose-600"
                              : "text-gray-700"
                          }`}
                        >
                          {budget.exceeded
                            ? `${formatCurrency(
                                Math.abs(budget.remaining)
                              )} over`
                            : `${formatCurrency(
                                budget.remaining
                              )} left`}
                        </span>
                      </div>

                      {budget.exceeded && (
                        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                          You have exceeded this category&apos;s monthly
                          budget. Consider reducing further spending.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Add/Edit budget modal */}
          {isFormOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setIsFormOpen(false);
                }
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="budget-modal-title"
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2
                      id="budget-modal-title"
                      className="text-xl font-bold text-gray-900"
                    >
                      {editingId ? "Edit Budget" : "Create Budget"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Set a spending limit for {monthLabel}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    aria-label="Close budget form"
                    className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveBudget} className="space-y-5">
                  <div>
                    <label
                      htmlFor="budget-category"
                      className="text-sm font-medium text-gray-700"
                    >
                      Category
                    </label>

                    <select
                      id="budget-category"
                      value={form.category}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          category: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                      {categories.map((category) => {
                        const alreadyExists = monthBudgets.some(
                          (budget) =>
                            budget.category === category &&
                            budget.id !== editingId
                        );

                        return (
                          <option
                            key={category}
                            value={category}
                            disabled={alreadyExists}
                          >
                            {category}
                            {alreadyExists ? " (budget exists)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="budget-limit"
                      className="text-sm font-medium text-gray-700"
                    >
                      Monthly limit (₹)
                    </label>

                    <input
                      id="budget-limit"
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={form.limit}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          limit: event.target.value,
                        }))
                      }
                      placeholder="e.g. 5000"
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-rose-600">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      {editingId ? "Save Changes" : "Create Budget"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}

function SummaryCard({
  title,
  amount,
  icon: Icon,
  iconStyle,
  description,
  isCount = false,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
            {isCount ? amount : formatCurrency(amount)}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-5 text-xs text-gray-500">{description}</p>
    </div>
  );
}
