
"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CalendarDays,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import AppLayout from "@/components/AppLayout";
import { useTransactions } from "@/components/TransactionProvider";

const COLORS = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#0ea5e9",
  "#ef4444",
  "#14b8a6",
  "#94a3b8",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatCompactCurrency = (amount) => {
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  }

  return `₹${amount}`;
};

const getMonthKey = (date) => {
  if (!date) return "";
  return date.slice(0, 7);
};

const getMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

export default function AnalyticsPage() {
  const { transactions, isLoaded } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState("all");

  const availableMonths = useMemo(() => {
    const months = transactions
      .map((transaction) => getMonthKey(transaction.date))
      .filter(Boolean);

    return [...new Set(months)].sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "all") return transactions;

    return transactions.filter(
      (transaction) => getMonthKey(transaction.date) === selectedMonth
    );
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((transaction) => transaction.type === "Income")
      .reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0
      );

    const expenses = filteredTransactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0
      );

    return {
      income,
      expenses,
      savings: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const grouped = {};

    transactions.forEach((transaction) => {
      const month = getMonthKey(transaction.date);
      if (!month) return;

      if (!grouped[month]) {
        grouped[month] = {
          month,
          income: 0,
          expenses: 0,
        };
      }

      if (transaction.type === "Income") {
        grouped[month].income += Number(transaction.amount || 0);
      } else if (transaction.type === "Expense") {
        grouped[month].expenses += Number(transaction.amount || 0);
      }
    });

    return Object.values(grouped)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((item) => ({
        ...item,
        label: getMonthLabel(item.month),
        savings: item.income - item.expenses,
      }));
  }, [transactions]);

  const categoryData = useMemo(() => {
    const grouped = {};

    filteredTransactions
      .filter((transaction) => transaction.type === "Expense")
      .forEach((transaction) => {
        const category = transaction.category || "Other";

        grouped[category] =
          (grouped[category] || 0) + Number(transaction.amount || 0);
      });

    return Object.entries(grouped)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const dailyData = useMemo(() => {
    const grouped = {};

    filteredTransactions
      .filter((transaction) => transaction.type === "Expense")
      .forEach((transaction) => {
        const date = transaction.date;
        if (!date) return;

        grouped[date] = (grouped[date] || 0) + Number(transaction.amount || 0);
      });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, expenses]) => ({
        date: new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        expenses,
      }));
  }, [filteredTransactions]);

  const topCategories = categoryData.slice(0, 5);

  const highestCategory = topCategories[0];

  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-7">
          {/* Heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Understand your money
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Analytics
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Explore spending patterns and track your financial progress.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <CalendarDays size={18} className="text-gray-400" />

              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="max-w-[190px] bg-transparent text-sm font-medium text-gray-700 outline-none"
                aria-label="Select analytics period"
              >
                <option value="all">All time</option>

                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {getMonthLabel(month)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isLoaded ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500">
              Loading your analytics...
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title="Total Income"
                  amount={summary.income}
                  icon={TrendingUp}
                  iconStyle="bg-emerald-50 text-emerald-600"
                  note={`${filteredTransactions.filter((t) => t.type === "Income").length} income transactions`}
                />

                <SummaryCard
                  title="Total Expenses"
                  amount={summary.expenses}
                  icon={TrendingDown}
                  iconStyle="bg-rose-50 text-rose-600"
                  note={`${filteredTransactions.filter((t) => t.type === "Expense").length} expense transactions`}
                />

                <SummaryCard
                  title="Net Savings"
                  amount={summary.savings}
                  icon={PiggyBank}
                  iconStyle="bg-blue-50 text-blue-600"
                  note="Income minus expenses"
                  negative={summary.savings < 0}
                />

                <SummaryCard
                  title="Savings Rate"
                  amount={`${summary.savingsRate.toFixed(1)}%`}
                  icon={Wallet}
                  iconStyle="bg-violet-50 text-violet-600"
                  note="Net savings as a share of income"
                  isText
                />
              </div>

              {/* Income and expenses trend */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <BarChart3 size={21} className="text-emerald-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Income & Expenses Trend
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Monthly comparison based on your recorded transactions.
                    </p>
                  </div>
                </div>

                {monthlyData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="mt-7 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyData}
                        margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="analyticsIncome"
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
                            id="analyticsExpenses"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#f97316"
                              stopOpacity={0.18}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f97316"
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
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          dy={10}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickFormatter={formatCompactCurrency}
                        />

                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #f1f5f9",
                          }}
                        />

                        <Legend />

                        <Area
                          type="monotone"
                          dataKey="income"
                          name="Income"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#analyticsIncome)"
                          activeDot={{ r: 5 }}
                        />

                        <Area
                          type="monotone"
                          dataKey="expenses"
                          name="Expenses"
                          stroke="#f97316"
                          strokeWidth={2.5}
                          fill="url(#analyticsExpenses)"
                          activeDot={{ r: 5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              {/* Category and savings charts */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-violet-50 p-3">
                      <PieChartIcon
                        size={21}
                        className="text-violet-600"
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Spending by Category
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        See where your money goes.
                      </p>
                    </div>
                  </div>

                  {categoryData.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <>
                      <div className="mt-5 h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              dataKey="amount"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={100}
                              paddingAngle={3}
                              stroke="none"
                            >
                              {categoryData.map((entry) => (
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
                      </div>

                      <div className="space-y-4">
                        {categoryData.map((category) => {
                          const percentage =
                            summary.expenses > 0
                              ? (category.amount / summary.expenses) * 100
                              : 0;

                          return (
                            <div key={category.name}>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                      backgroundColor: category.color,
                                    }}
                                  />
                                  <span className="text-sm text-gray-600">
                                    {category.name}
                                  </span>
                                </div>

                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(category.amount)}
                                </span>
                              </div>

                              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: category.color,
                                  }}
                                />
                              </div>

                              <p className="mt-1 text-right text-xs text-gray-400">
                                {percentage.toFixed(1)}%
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <TrendingUp size={21} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Monthly Net Savings
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Compare income retained after expenses.
                      </p>
                    </div>
                  </div>

                  {monthlyData.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <div className="mt-7 h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -12,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            stroke="#f1f5f9"
                            strokeDasharray="4 4"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            dy={10}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            tickFormatter={formatCompactCurrency}
                          />

                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                          />

                          <Bar
                            dataKey="savings"
                            name="Net savings"
                            fill="#6366f1"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </section>
              </div>

              {/* Insights */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-50 p-3">
                    <TrendingUp size={21} className="text-amber-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Spending Insights
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      A quick summary of your selected period.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InsightCard
                    title="Top spending category"
                    value={highestCategory?.name || "No data yet"}
                    description={
                      highestCategory
                        ? `${formatCurrency(
                            highestCategory.amount
                          )} spent in this category.`
                        : "Add expense transactions to see your top category."
                    }
                  />

                  <InsightCard
                    title="Savings performance"
                    value={
                      summary.savings >= 0
                        ? "Positive balance"
                        : "Spending exceeds income"
                    }
                    description={
                      summary.savings >= 0
                        ? `You retained ${formatCurrency(
                            summary.savings
                          )} after recorded expenses.`
                        : `Your expenses exceed income by ${formatCurrency(
                            Math.abs(summary.savings)
                          )}.`
                    }
                  />

                  <InsightCard
                    title="Activity recorded"
                    value={String(summary.transactionCount)}
                    description="Income and expense transactions included in this period."
                  />
                </div>
              </section>
            </>
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
  note,
  isText = false,
  negative = false,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3
            className={`mt-3 text-2xl font-bold tracking-tight ${
              negative ? "text-rose-600" : "text-gray-900"
            }`}
          >
            {isText ? amount : formatCurrency(amount)}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-5 text-xs text-gray-500">{note}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <div className="rounded-2xl bg-gray-100 p-4">
        <BarChart3 size={25} className="text-gray-400" />
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-800">
        Not enough data yet
      </p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Add some transactions to see your financial analytics here.
      </p>
    </div>
  );
}

function InsightCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <h3 className="mt-2 break-words text-base font-bold text-gray-900">
        {value}
      </h3>
      <p className="mt-2 text-sm leading-5 text-gray-500">{description}</p>
    </div>
  );
}
