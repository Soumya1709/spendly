
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useTransactions } from "@/components/TransactionProvider";

const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food & Dining", type: "Expense", color: "#F59E0B", icon: "🍔" },
  { id: "transport", name: "Transportation", type: "Expense", color: "#3B82F6", icon: "🚗" },
  { id: "shopping", name: "Shopping", type: "Expense", color: "#EC4899", icon: "🛍️" },
  { id: "bills", name: "Bills & Utilities", type: "Expense", color: "#8B5CF6", icon: "💡" },
  { id: "health", name: "Healthcare", type: "Expense", color: "#EF4444", icon: "❤️" },
  { id: "entertainment", name: "Entertainment", type: "Expense", color: "#06B6D4", icon: "🎬" },
  { id: "education", name: "Education", type: "Expense", color: "#6366F1", icon: "📚" },
  { id: "salary", name: "Salary", type: "Income", color: "#10B981", icon: "💰" },
  { id: "freelance", name: "Freelance", type: "Income", color: "#14B8A6", icon: "💻" },
  { id: "investment", name: "Investments", type: "Income", color: "#84CC16", icon: "📈" },
];

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#6366F1",
];

const EMOJIS = ["📁", "🍔", "🚗", "🛍️", "💡", "❤️", "🎬", "📚", "💰", "💻", "📈", "🏠", "✈️", "☕"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export default function CategoriesPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const { transactions, setTransactions } = useTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "Expense",
    color: COLORS[0],
    icon: EMOJIS[0],
  });

  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem("spendly_categories");

      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        localStorage.setItem(
          "spendly_categories",
          JSON.stringify(DEFAULT_CATEGORIES)
        );
      }

    } catch (error) {
      console.error("Unable to load categories:", error);
    }
  }, []);

  const saveCategories = (updatedCategories) => {
    setCategories(updatedCategories);
    localStorage.setItem(
      "spendly_categories",
      JSON.stringify(updatedCategories)
    );
  };

  const categoryStats = useMemo(() => {
    return categories.map((category) => {
      const matchingTransactions = transactions.filter(
        (transaction) =>
          String(transaction.category || "").toLowerCase() ===
          category.name.toLowerCase()
      );

      const amount = matchingTransactions.reduce((total, transaction) => {
        const transactionType = String(transaction.type || "").toLowerCase();
        const categoryType = category.type.toLowerCase();

        if (
          (categoryType === "expense" && transactionType === "expense") ||
          (categoryType === "income" && transactionType === "income")
        ) {
          return total + Number(transaction.amount || 0);
        }

        return total;
      }, 0);

      return {
        ...category,
        transactionCount: matchingTransactions.length,
        amount,
      };
    });
  }, [categories, transactions]);

  const filteredCategories = categoryStats.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || category.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const expenseCategories = categories.filter(
    (category) => category.type === "Expense"
  ).length;

  const incomeCategories = categories.filter(
    (category) => category.type === "Income"
  ).length;

  const totalExpense = categoryStats
    .filter((category) => category.type === "Expense")
    .reduce((total, category) => total + category.amount, 0);

  const totalIncome = categoryStats
    .filter((category) => category.type === "Income")
    .reduce((total, category) => total + category.amount, 0);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      type: "Expense",
      color: COLORS[0],
      icon: EMOJIS[0],
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
    setShowModal(true);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      alert("Please enter a category name.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() &&
        category.type === form.type &&
        category.id !== editingId
    );

    if (duplicate) {
      alert("A category with this name and type already exists.");
      return;
    }

    if (editingId) {
      const oldCategory = categories.find(
        (category) => category.id === editingId
      );

      const updatedCategories = categories.map((category) =>
        category.id === editingId
          ? { ...category, ...form, name }
          : category
      );

      saveCategories(updatedCategories);

      if (oldCategory && oldCategory.name !== name) {
        const updatedTransactions = transactions.map((transaction) =>
          transaction.category === oldCategory.name
            ? { ...transaction, category: name }
            : transaction
        );

        // Update the shared transaction store so every page stays in sync.
        setTransactions(updatedTransactions);
      }
    } else {
      const newCategory = {
        id: crypto.randomUUID(),
        ...form,
        name,
      };

      saveCategories([...categories, newCategory]);
    }

    setShowModal(false);
  };

  const handleDelete = (category) => {
    const usedByTransactions = transactions.some(
      (transaction) => transaction.category === category.name
    );

    const message = usedByTransactions
      ? `"${category.name}" is used by existing transactions. Delete this category anyway? Transactions will remain saved, but the category will be removed from this list.`
      : `Delete the "${category.name}" category?`;

    if (!window.confirm(message)) return;

    saveCategories(
      categories.filter((item) => item.id !== category.id)
    );
  };

  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                ORGANIZE YOUR FINANCES
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Categories
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Organize your income and expenses with custom categories.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add category
            </button>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total categories"
              value={categories.length}
              subtitle="All income and expense categories"
              icon={Tags}
            />
            <SummaryCard
              title="Expense categories"
              value={expenseCategories}
              subtitle="Categories for outgoing money"
              icon={ArrowDownRight}
            />
            <SummaryCard
              title="Income categories"
              value={incomeCategories}
              subtitle="Categories for incoming money"
              icon={ArrowUpRight}
            />
            <SummaryCard
              title="Categorized expenses"
              value={formatCurrency(totalExpense)}
              subtitle={`Income recorded: ${formatCurrency(totalIncome)}`}
              icon={Wallet}
            />
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex gap-2">
              {["All", "Expense", "Income"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    typeFilter === type
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
              <Tags size={36} className="mx-auto text-gray-300" />
              <h3 className="mt-4 font-semibold text-gray-900">
                No categories found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or add a new category.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                        style={{
                          backgroundColor: `${category.color}18`,
                        }}
                      >
                        {category.icon}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            category.type === "Income"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {category.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={() => openEditModal(category)}
                        title="Edit category"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        title="Delete category"
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          {category.type === "Income"
                            ? "Total income"
                            : "Total expenses"}
                        </p>
                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {formatCurrency(category.amount)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">Transactions</p>
                        <p className="mt-1 font-semibold text-gray-700">
                          {category.transactionCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex gap-3">
              <TrendingUp
                size={20}
                className="mt-0.5 shrink-0 text-emerald-700"
              />
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Keep your categories consistent
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Transaction totals are matched using category names. When
                  renaming a category here, existing transactions are updated
                  too. New categories will be available in your category
                  manager, but your transaction form must read this saved list
                  to offer them automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Edit category" : "Add category"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a name, type, icon, and color.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category name
                  </label>
                  <input
                    autoFocus
                    required
                    maxLength={40}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Travel"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Expense", "Income"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          form.type === type
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Choose an icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, icon: emoji })}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition ${
                          form.icon === emoji
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Choose a color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Choose ${color}`}
                        onClick={() => setForm({ ...form, color })}
                        className={`h-8 w-8 rounded-full transition ${
                          form.color === color
                            ? "ring-2 ring-gray-800 ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    {editingId ? "Save changes" : "Create category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
