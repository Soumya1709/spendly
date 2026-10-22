
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Utensils,
  ShoppingBag,
  Car,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Plane,
  BriefcaseBusiness,
  Laptop,
  Gift,
  MoreHorizontal,
  CreditCard,
  X,
} from "lucide-react";

import AppLayout from "@/components/AppLayout";
import AddTransactionModal from "@/components/AddTransactionModal";
import { useTransactions } from "@/components/TransactionProvider";

const categoryIcons = {
  "Food & Dining": Utensils,
  Shopping: ShoppingBag,
  Transportation: Car,
  Entertainment: Clapperboard,
  "Bills & Utilities": Receipt,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Travel: Plane,
  Salary: BriefcaseBusiness,
  Freelance: Laptop,
  Investments: CreditCard,
  Business: BriefcaseBusiness,
  Gift: Gift,
  Other: MoreHorizontal,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, isLoaded } =
    useTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);


  const categories = useMemo(() => {
    return [
      ...new Set(
        transactions
          .map((transaction) => transaction.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const matchesSearch = [
          transaction.title,
          transaction.category,
          transaction.paymentMethod,
          transaction.notes,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

        const matchesType =
          typeFilter === "All" || transaction.type === typeFilter;

        const matchesCategory =
          categoryFilter === "All" ||
          transaction.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        const comparison = (a.date || "").localeCompare(b.date || "");

        return sortOrder === "newest" ? -comparison : comparison;
      });
  }, [transactions, search, typeFilter, categoryFilter, sortOrder]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((transaction) => transaction.type === "Income")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const expenses = filteredTransactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      income,
      expenses,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const handleAddTransaction = (transaction) => {
    addTransaction(transaction);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction? This action cannot be undone."
    );

    if (!confirmed) return;

    deleteTransaction(id);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setCategoryFilter("All");
    setSortOrder("newest");
  };

  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-7">
          {/* Heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Manage your money
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Transactions
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                View, search, filter, and manage your financial activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={!isLoaded}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Matching transactions</p>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {isLoaded ? summary.count : "—"}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Based on current filters
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Income</p>
              <p className="mt-3 text-2xl font-bold text-emerald-600">
                {isLoaded ? formatCurrency(summary.income) : "—"}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Matching income records
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="mt-3 text-2xl font-bold text-rose-600">
                {isLoaded ? formatCurrency(summary.expenses) : "—"}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Matching expense records
              </p>
            </div>
          </div>

          {/* Search and filters */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-500"
                aria-label="Filter by transaction type"
              >
                <option value="All">All types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-500"
                aria-label="Filter by category"
              >
                <option value="All">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-500"
                aria-label="Sort transactions by date"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-emerald-600"
              >
                <X size={15} />
                Clear filters
              </button>
            </div>
          </section>

          {/* Transaction table */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-gray-900">
                All Transactions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isLoaded
                  ? `${filteredTransactions.length} matching records`
                  : "Loading transactions..."}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4 font-semibold">Transaction</th>
                    <th className="px-4 py-4 font-semibold">Date</th>
                    <th className="px-4 py-4 font-semibold">Payment method</th>
                    <th className="px-4 py-4 font-semibold">Type</th>
                    <th className="px-4 py-4 text-right font-semibold">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {isLoaded &&
                    filteredTransactions.map((transaction) => {
                      const Icon =
                        categoryIcons[transaction.category] || Receipt;

                      const isIncome = transaction.type === "Income";

                      return (
                        <tr
                          key={transaction.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  isIncome ? "bg-emerald-50" : "bg-gray-100"
                                }`}
                              >
                                <Icon
                                  size={18}
                                  className={
                                    isIncome
                                      ? "text-emerald-600"
                                      : "text-gray-600"
                                  }
                                />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {transaction.title}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {transaction.category}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                            {formatDate(transaction.date)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                            {transaction.paymentMethod || "—"}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isIncome
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {isIncome ? (
                                <ArrowDownLeft size={13} />
                              ) : (
                                <ArrowUpRight size={13} />
                              )}
                              {transaction.type}
                            </span>
                          </td>

                          <td
                            className={`whitespace-nowrap px-4 py-4 text-right text-sm font-bold ${
                              isIncome ? "text-emerald-600" : "text-gray-900"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDelete(transaction.id)}
                              title="Delete transaction"
                              aria-label={`Delete ${transaction.title}`}
                              className="inline-flex rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                  {isLoaded && filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                          <Receipt size={25} className="text-gray-400" />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-gray-900">
                          No transactions found
                        </h3>

                        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                          Try changing your filters or add a new transaction
                          to get started.
                        </p>

                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          <Plus size={16} />
                          Add your first transaction
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddTransaction={handleAddTransaction}
          />
        </div>
      </main>
    </AppLayout>
  );
}
