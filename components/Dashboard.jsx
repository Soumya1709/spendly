
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Car,
  Clapperboard,
  Receipt,
  HeartPulse,
  GraduationCap,
  Plane,
  MoreHorizontal,
  BriefcaseBusiness,
  Laptop,
  Gift,
  CircleDollarSign,
  CalendarDays,
  CreditCard,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import AppLayout from "./AppLayout";
import AddTransactionModal from "./AddTransactionModal";
import { useTransactions } from "./TransactionProvider";

const BUDGETS_KEY = "spendly_budgets";

const getMonthKey = (date) => {
  if (!date) return "";
  const value = String(date);
  return /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : "";
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};


const categoryConfig = {
  "Food & Dining": {
    color: "#10b981",
    icon: Utensils,
  },
  Shopping: {
    color: "#6366f1",
    icon: ShoppingBag,
  },
  Transportation: {
    color: "#f59e0b",
    icon: Car,
  },
  Entertainment: {
    color: "#ec4899",
    icon: Clapperboard,
  },
  "Bills & Utilities": {
    color: "#8b5cf6",
    icon: Receipt,
  },
  Healthcare: {
    color: "#ef4444",
    icon: HeartPulse,
  },
  Education: {
    color: "#0ea5e9",
    icon: GraduationCap,
  },
  Travel: {
    color: "#14b8a6",
    icon: Plane,
  },
  Salary: {
    color: "#10b981",
    icon: BriefcaseBusiness,
  },
  Freelance: {
    color: "#6366f1",
    icon: Laptop,
  },
  Investments: {
    color: "#f59e0b",
    icon: TrendingUp,
  },
  Business: {
    color: "#8b5cf6",
    icon: BriefcaseBusiness,
  },
  Gift: {
    color: "#ec4899",
    icon: Gift,
  },
  Other: {
    color: "#94a3b8",
    icon: MoreHorizontal,
  },
};



const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function SummaryCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendColor,
  isPercentage = false,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {isPercentage ? `${Number(amount || 0).toFixed(1)}%` : formatCurrency(amount)}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
        {trend && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${trendColor}`}
          >
            {trend}
          </span>
        )}
        <span className="text-gray-500">{subtitle}</span>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-gray-800">{label}</p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center gap-2 py-1 text-sm"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-500">{item.name}</span>
          <span className="ml-3 font-semibold text-gray-900">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] =
    useState(false);

  const { transactions, addTransaction, isLoaded } = useTransactions();
  const [savedBudgets, setSavedBudgets] = useState([]);
  const [budgetsLoaded, setBudgetsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BUDGETS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      setSavedBudgets(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("Failed to load budgets:", error);
      setSavedBudgets([]);
    } finally {
      setBudgetsLoaded(true);
    }
  }, []);

  const [period, setPeriod] = useState("6 months");

  const [selectedType, setSelectedType] = useState("All");

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "Income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = transactions
      .filter((item) => item.type === "Expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthTransactions = transactions.filter(
        (transaction) => getMonthKey(transaction.date) === monthKey
      );

      months.push({
        month: date.toLocaleDateString("en-IN", { month: "short" }),
        income: monthTransactions
          .filter((transaction) => transaction.type === "Income")
          .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
        expenses: monthTransactions
          .filter((transaction) => transaction.type === "Expense")
          .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
      });
    }

    return months;
  }, [transactions]);

  const budgetOverview = useMemo(() => {
    const currentMonth = getCurrentMonthKey();
    return savedBudgets
      .filter((budget) => budget.month === currentMonth)
      .map((budget) => {
        const spent = transactions
          .filter(
            (transaction) =>
              transaction.type === "Expense" &&
              transaction.category === budget.category &&
              getMonthKey(transaction.date) === currentMonth
          )
          .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

        return {
          name: budget.category,
          spent,
          limit: Number(budget.limit) || 0,
          color: categoryConfig[budget.category]?.color || "#10b981",
        };
      })
      .sort((a, b) => b.spent / (b.limit || 1) - a.spent / (a.limit || 1))
      .slice(0, 4);
  }, [savedBudgets, transactions]);

  const currentMonthInsight = useMemo(() => {
    const currentMonth = getCurrentMonthKey();

    const currentMonthExpenses = transactions.filter(
      (transaction) =>
        transaction.type === "Expense" &&
        getMonthKey(transaction.date) === currentMonth
    );

    const monthSpent = currentMonthExpenses.reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0
    );

    const exceededBudgets = budgetOverview.filter(
      (budget) => budget.limit > 0 && budget.spent > budget.limit
    );

    const closestBudget = budgetOverview
      .filter((budget) => budget.limit > 0 && budget.spent <= budget.limit)
      .sort((a, b) => b.spent / b.limit - a.spent / a.limit)[0];

    const monthCategoryTotals = currentMonthExpenses.reduce((totals, transaction) => {
      const category = transaction.category || "Other";
      totals[category] = (totals[category] || 0) + Number(transaction.amount || 0);
      return totals;
    }, {});

    const topCategory = Object.entries(monthCategoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (exceededBudgets.length > 0) {
      const first = exceededBudgets[0];
      return {
        title: "Budget limit exceeded",
        message: `${first.name} is over budget by ${formatCurrency(first.spent - first.limit)}. Review this category to bring spending back on track.`,
      };
    }

    if (closestBudget && closestBudget.spent / closestBudget.limit >= 0.8) {
      return {
        title: "Budget almost reached",
        message: `${closestBudget.name} has used ${Math.round((closestBudget.spent / closestBudget.limit) * 100)}% of its monthly budget. Keep an eye on the remaining ${formatCurrency(Math.max(0, closestBudget.limit - closestBudget.spent))}.`,
      };
    }

    if (topCategory) {
      return {
        title: "Your top spending category",
        message: `${topCategory[0]} is your largest expense category this month at ${formatCurrency(topCategory[1])}. Total expenses this month are ${formatCurrency(monthSpent)}.`,
      };
    }

    return {
      title: "Ready when you are",
      message: "Add an expense to see a personalized spending insight here. Your dashboard will update as you record transactions.",
    };
  }, [transactions, budgetOverview]);

  const spendingByCategory = useMemo(() => {
    const grouped = {};

    transactions
      .filter((item) => item.type === "Expense")
      .forEach((item) => {
        grouped[item.category] =
          (grouped[item.category] || 0) + Number(item.amount);
      });

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        color: categoryConfig[name]?.color || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions
      .filter(
        (item) => selectedType === "All" || item.type === selectedType
      )
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .slice(0, 5);
  }, [transactions, selectedType]);

  const handleAddTransaction = (transaction) => {
    addTransaction(transaction);
    setIsTransactionModalOpen(false);
  };

  const chartData =
    period === "3 months"
      ? monthlyData.slice(-3)
      : period === "1 month"
        ? monthlyData.slice(-1)
        : monthlyData;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-7">
          {/* Page heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Welcome back!
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Financial Overview
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Here&apos;s what&apos;s happening with your money.
              </p>
            </div>

            <button
              type="button"
              disabled={!isLoaded}
              onClick={() => setIsTransactionModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              <Plus size={18} />
              {isLoaded ? "Add Transaction" : "Loading..."}
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Balance"
              amount={totals.balance}
              subtitle="Income minus expenses"
              icon={Wallet}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              trend="Available"
              trendColor="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Total Income"
              amount={totals.income}
              subtitle="Across recorded transactions"
              icon={TrendingUp}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              trend="Income"
              trendColor="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Total Expenses"
              amount={totals.expenses}
              subtitle="Across recorded transactions"
              icon={TrendingDown}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              trend="Spending"
              trendColor="bg-rose-50 text-rose-700"
            />

            <SummaryCard
              title="Savings Rate"
              amount={totals.income > 0 ? (totals.balance / totals.income) * 100 : 0}
              isPercentage
              subtitle="Income retained after expenses"
              icon={CircleDollarSign}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              trend="Current savings rate"
              trendColor="bg-violet-50 text-violet-700"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Income and expenses chart */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Income vs Expenses
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Track your financial activity over time.
                  </p>
                </div>

                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-500"
                  aria-label="Chart time period"
                >
                  <option>6 months</option>
                  <option>3 months</option>
                  <option>1 month</option>
                </select>
              </div>

              <div className="mt-7 flex flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-500">Income</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  <span className="text-sm text-gray-500">Expenses</span>
                </div>
              </div>

              <div className="mt-5 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="incomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#fb923c"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#fb923c"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={(value) =>
                        value >= 1000
                          ? `₹${value / 1000}k`
                          : `₹${value}`
                      }
                    />

                    <Tooltip content={<ChartTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#incomeGradient)"
                      activeDot={{ r: 5 }}
                    />

                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#fb923c"
                      strokeWidth={2.5}
                      fill="url(#expenseGradient)"
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Category chart */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Spending Breakdown
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Expenses by category.
                </p>
              </div>

              <div className="relative mt-4 h-[210px]">
                {spendingByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {spendingByCategory.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-500">
                        Total spent
                      </span>
                      <span className="mt-1 text-xl font-bold text-gray-900">
                        {formatCurrency(totals.expenses)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No expense data yet.
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-4">
                {spendingByCategory.slice(0, 4).map((category) => {
                  const percentage =
                    totals.expenses > 0
                      ? (category.value / totals.expenses) * 100
                      : 0;

                  return (
                    <div key={category.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="truncate text-sm text-gray-600">
                            {category.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                          {Math.round(percentage)}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Recent transactions and budgets */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Transactions table */}
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent Transactions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your latest financial activity.
                  </p>
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-500"
                  aria-label="Filter transactions"
                >
                  <option value="All">All transactions</option>
                  <option value="Income">Income only</option>
                  <option value="Expense">Expenses only</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-400">
                      <th className="px-6 py-4 font-semibold">
                        Transaction
                      </th>
                      <th className="px-4 py-4 font-semibold">Date</th>
                      <th className="px-4 py-4 font-semibold">Method</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.map((transaction) => {
                      const Icon =
                        categoryConfig[transaction.category]?.icon ||
                        CreditCard;

                      const isIncome = transaction.type === "Income";

                      return (
                        <tr
                          key={transaction.id}
                          className="transition hover:bg-gray-50/80"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  isIncome
                                    ? "bg-emerald-50"
                                    : "bg-gray-100"
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
                            {transaction.paymentMethod}
                          </td>

                          <td
                            className={`whitespace-nowrap px-6 py-4 text-right text-sm font-bold ${
                              isIncome
                                ? "text-emerald-600"
                                : "text-gray-900"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      );
                    })}

                    {recentTransactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-10 text-center text-sm text-gray-500"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-500">
                  Showing {recentTransactions.length} transactions
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedType("All")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  Reset filter
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>

            {/* Budget overview */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Budget Overview
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Keep your spending on track.
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <CalendarDays
                    size={19}
                    className="text-emerald-600"
                  />
                </div>
              </div>

              <div className="mt-7 space-y-6">
                {!budgetsLoaded ? (
                  <p className="py-6 text-center text-sm text-gray-500">Loading budgets...</p>
                ) : budgetOverview.length > 0 ? budgetOverview.map((budget) => {
                  const rawPercentage =
                    budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                  const barPercentage = Math.min(Math.max(rawPercentage, 0), 100);
                  const displayedPercentage = Math.round(Math.max(rawPercentage, 0));
                  const exceeded = budget.limit > 0 && budget.spent > budget.limit;

                  return (
                    <div key={budget.name}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-gray-700">
                          {budget.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {displayedPercentage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${barPercentage}%`,
                            backgroundColor: exceeded
                              ? "#ef4444"
                              : budget.color,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-gray-700">
                          {formatCurrency(budget.spent)}
                        </span>
                        <span className="text-xs text-gray-400">
                          of {formatCurrency(budget.limit)}
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-gray-700">No budgets for this month</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">Create a category budget to see your spending progress here.</p>
                  </div>
                )}
              </div>

              <div className="mt-7 rounded-xl bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2">
                    <TrendingUp
                      size={18}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {currentMonthInsight.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      {currentMonthInsight.message}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/budgets"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                View Budgets
                <ArrowRight size={16} />
              </Link>
            </section>
          </div>

          {/* Add transaction modal */}
          <AddTransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            onAddTransaction={handleAddTransaction}
          />
        </div>
      </div>
    </AppLayout>
  );
}
