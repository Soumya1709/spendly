"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, X, Wallet, TrendingDown, AlertTriangle, Check } from "lucide-react";
import { useTransactions } from "@/components/TransactionProvider";

const BUDGETS_KEY = "spendly_budgets";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function Header({ onMenuClick }) {
  const router = useRouter();
  const { transactions, isLoaded } = useTransactions();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [profileName, setProfileName] = useState("Spendly User");
  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    try {
      const storedBudgets = localStorage.getItem(BUDGETS_KEY);
      if (storedBudgets) {
        const parsed = JSON.parse(storedBudgets);
        setBudgets(Array.isArray(parsed) ? parsed : []);
      }

      const savedProfile = localStorage.getItem("spendly_profile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        if (parsedProfile?.name) setProfileName(parsedProfile.name);
      }

      const storedRead = localStorage.getItem("spendly_read_notifications");
      if (storedRead) {
        const parsed = JSON.parse(storedRead);
        setReadNotifications(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Unable to load header preferences:", error);
    }
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const notifications = useMemo(() => {
    if (!isLoaded) return [];

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const spentByCategory = transactions
      .filter((transaction) =>
        transaction.type === "Expense" &&
        String(transaction.date || "").slice(0, 7) === monthKey
      )
      .reduce((result, transaction) => {
        const category = transaction.category || "Other";
        result[category] = (result[category] || 0) + (Number(transaction.amount) || 0);
        return result;
      }, {});

    return budgets
      .filter((budget) => budget && budget.month === monthKey)
      .map((budget) => {
        const limit = Number(budget.limit) || 0;
        const spent = spentByCategory[budget.category] || 0;
        if (limit <= 0 || spent < limit * 0.8) return null;

        if (spent > limit) {
          return {
            id: `over-${budget.id || budget.category}`,
            title: `${budget.category} budget exceeded`,
            message: `${formatCurrency(spent - limit)} over your monthly limit.`,
            icon: AlertTriangle,
            tone: "rose",
          };
        }

        if (spent >= limit) {
          return {
            id: `reached-${budget.id || budget.category}`,
            title: `${budget.category} budget reached`,
            message: `You've used your full ${formatCurrency(limit)} budget.`,
            icon: Wallet,
            tone: "amber",
          };
        }

        return {
          id: `near-${budget.id || budget.category}`,
          title: `${budget.category} budget almost used`,
          message: `${Math.round((spent / limit) * 100)}% used — ${formatCurrency(limit - spent)} remaining.`,
          icon: TrendingDown,
          tone: "amber",
        };
      })
      .filter(Boolean);
  }, [transactions, budgets, isLoaded]);

  const unreadCount = notifications.filter(
    (notification) => !readNotifications.includes(notification.id)
  ).length;

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return transactions.filter((transaction) => {
      const searchable = [
        transaction.title,
        transaction.category,
        transaction.type,
        transaction.paymentMethod,
        transaction.notes,
      ].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(query);
    }).slice(0, 6);
  }, [transactions, searchQuery]);

  const openTransaction = (transaction) => {
    const query = transaction.title || transaction.category || "";
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/transactions?search=${encodeURIComponent(query)}`);
  };

  const markAllAsRead = () => {
    const merged = [...new Set([...readNotifications, ...notifications.map((item) => item.id)])];
    setReadNotifications(merged);
    try {
      localStorage.setItem("spendly_read_notifications", JSON.stringify(merged));
    } catch (error) {
      console.error("Unable to save notification state:", error);
    }
  };

  const markAsRead = (id) => {
    const merged = [...new Set([...readNotifications, id])];
    setReadNotifications(merged);
    try {
      localStorage.setItem("spendly_read_notifications", JSON.stringify(merged));
    } catch (error) {
      console.error("Unable to save notification state:", error);
    }
  };

  const initials = profileName.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]).join("").toUpperCase() || "SS";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-100 bg-white/90 px-5 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>
        <div>
          <p className="text-sm font-medium text-gray-900">Personal Finance</p>
          <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">Take control of your money</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div ref={searchContainerRef} className="relative">
          {searchOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(88vw,360px)] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3">
                <Search size={17} className="shrink-0 text-gray-400" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && searchQuery.trim()) {
                      router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search transactions..."
                  aria-label="Search transactions"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-400"
                />
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} aria-label="Close search" className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
                  <X size={15} />
                </button>
              </div>

              {searchQuery.trim() && (
                <div className="mt-3">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Matching transactions</p>
                  {searchResults.length ? (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((transaction, index) => (
                        <button
                          key={transaction.id ?? `${transaction.title}-${transaction.date}-${index}`}
                          onClick={() => openTransaction(transaction)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-emerald-50"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-gray-800">{transaction.title || transaction.category || "Transaction"}</span>
                            <span className="mt-0.5 block text-xs text-gray-500">{transaction.category || transaction.type} · {transaction.date || "No date"}</span>
                          </span>
                          <span className={`shrink-0 text-sm font-semibold ${transaction.type === "Income" ? "text-emerald-600" : "text-gray-800"}`}>
                            {transaction.type === "Income" ? "+" : "−"}{formatCurrency(transaction.amount)}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-4 text-sm text-gray-500">{isLoaded ? "No matching transactions found." : "Loading transactions..."}</p>
                  )}
                  <button
                    onClick={() => { router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); }}
                    className="mt-2 w-full rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    View search results
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => { setNotificationsOpen(false); setSearchOpen((open) => !open); }}
            aria-label="Search transactions"
            aria-expanded={searchOpen}
            className={`rounded-xl p-2.5 transition-colors ${searchOpen ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Search size={19} />
          </button>
        </div>

        <div ref={notificationsRef} className="relative">
          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(88vw,360px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Budget alerts for this month</p>
                </div>
                {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Mark all read</button>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {!isLoaded ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications...</p>
                ) : notifications.length ? (
                  notifications.map((notification) => {
                    const Icon = notification.icon;
                    const isRead = readNotifications.includes(notification.id);
                    const toneClass = notification.tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600";
                    return (
                      <button
                        key={notification.id}
                        onClick={() => { markAsRead(notification.id); setNotificationsOpen(false); router.push("/budgets"); }}
                        className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${isRead ? "opacity-70" : "bg-emerald-50/30"}`}
                      >
                        <span className={`mt-0.5 rounded-lg p-2 ${toneClass}`}><Icon size={17} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-gray-800">{notification.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-gray-500">{notification.message}</span>
                        </span>
                        {!isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-5 py-8 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={20} /></span>
                    <p className="mt-3 text-sm font-semibold text-gray-800">You're all caught up</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">No budget alerts for this month.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => { setSearchOpen(false); setNotificationsOpen((open) => !open); }}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            className={`relative rounded-xl p-2.5 transition-colors ${notificationsOpen ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
          </button>
        </div>

        <button
          onClick={() => router.push("/settings")}
          aria-label={`Open settings for ${profileName}`}
          title="Open settings"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-200 hover:ring-2 hover:ring-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
