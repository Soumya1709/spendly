
"use client";

import { useEffect, useRef, useState } from "react";
import { useTransactions } from "@/components/TransactionProvider";
import {
  UserRound,
  Bell,
  ShieldCheck,
  Download,
  Trash2,
  Save,
  Database,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";


const SettingSection = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-emerald-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  </div>
);

export default function SettingsPage() {
  const { transactions, clearTransactions: clearStoredTransactions, isLoaded } = useTransactions();
  // Uncontrolled inputs avoid focus loss if a parent rerenders while typing.
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const [preferences, setPreferences] = useState({
    budgetAlerts: true,
    confirmDelete: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("spendly_profile");
      const savedPreferences = localStorage.getItem("spendly_preferences");

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        if (nameInputRef.current) nameInputRef.current.value = parsedProfile.name ?? "";
        if (emailInputRef.current) emailInputRef.current.value = parsedProfile.email ?? "";
      }
      if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    } catch (error) {
      console.error("Unable to load settings:", error);
    }
  }, []);

  const saveSettings = () => {
    const profile = {
      name: nameInputRef.current?.value ?? "",
      email: emailInputRef.current?.value ?? "",
    };
    localStorage.setItem("spendly_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("spendly-profile-updated"));
    localStorage.setItem(
      "spendly_preferences",
      JSON.stringify(preferences)
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const exportTransactions = () => {
    if (!isLoaded) {
      alert("Transactions are still loading. Please try again.");
      return;
    }

    if (!transactions.length) {
      alert("No transactions available to export.");
      return;
    }

    const columns = ["title", "amount", "type", "category", "date"];
    const csv = [
      columns.join(","),
      ...transactions.map((transaction) =>
        columns
          .map((column) =>
            JSON.stringify(transaction[column] ?? "")
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spendly-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearTransactions = () => {
    const confirmed = window.confirm(
      "Delete ALL transactions? This action cannot be undone."
    );

    if (!confirmed) return;

    clearStoredTransactions();
  };



  return (
    <AppLayout>
      <main className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-medium text-emerald-700">
              PREFERENCES
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Settings
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your profile, preferences, and financial data.
            </p>
          </div>

          <div className="space-y-6">
            <SettingSection
              icon={UserRound}
              title="Profile"
              description="Personalize your Spendly experience."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Display name
                  </label>
                  <input
                    ref={nameInputRef}
                    defaultValue="Spendly User"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    defaultValue=""
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </SettingSection>

            <SettingSection
              icon={Bell}
              title="Preferences"
              description="Choose how you want to manage your finances."
            >
              <Toggle
                checked={preferences.budgetAlerts}
                onChange={(value) =>
                  setPreferences({ ...preferences, budgetAlerts: value })
                }
                label="Budget alerts preference"
                description="Save your preference for budget-related alerts."
              />

              <div className="border-t border-gray-100" />

              <Toggle
                checked={preferences.confirmDelete}
                onChange={(value) =>
                  setPreferences({ ...preferences, confirmDelete: value })
                }
                label="Confirm before deleting"
                description="Preference for confirmation before destructive actions."
              />
            </SettingSection>

            <SettingSection
              icon={Database}
              title="Your data"
              description="Export a backup or clear locally stored transactions."
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    Export transactions
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Download your transactions as a CSV file.
                  </p>
                </div>
                <button
                  onClick={exportTransactions}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>

              <div className="my-5 border-t border-gray-100" />

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium text-red-600">
                    Delete all transactions
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Permanently remove locally saved transaction data.
                  </p>
                </div>
                <button
                  onClick={handleClearTransactions}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Clear data
                </button>
              </div>
            </SettingSection>

            {/* <SettingSection
              icon={ShieldCheck}
              title="Privacy & storage"
              description="Understand where your current app data is stored."
            >
              <p className="text-sm leading-6 text-gray-600">
                Spendly currently stores transactions and preferences in this
                browser&apos;s local storage. They are not synced across
                devices, and clearing browser data may remove them. This is
                local storage, not a cloud backup.
              </p>
            </SettingSection> */}

            <div className="flex flex-wrap items-center justify-end gap-3">
              {saved && (
                <span className="text-sm font-medium text-emerald-700">
                  Settings saved!
                </span>
              )}
              <button
                onClick={saveSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Save size={16} />
                Save settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
