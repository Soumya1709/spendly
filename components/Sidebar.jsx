
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Tags,
  Settings,
  Leaf,
  X,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", href: "/budgets", icon: Wallet },
  { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Settings", href: "/settings", icon: Settings },
];

const PROFILE_KEY = "spendly_profile";
const DEFAULT_NAME = "Spendly User";

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState(DEFAULT_NAME);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedProfile = localStorage.getItem(PROFILE_KEY);
        const profile = savedProfile ? JSON.parse(savedProfile) : {};
        setUserName(
          typeof profile.name === "string" && profile.name.trim()
            ? profile.name.trim()
            : DEFAULT_NAME
        );
      } catch (error) {
        console.error("Unable to load user profile:", error);
        setUserName(DEFAULT_NAME);
      }
    };

    loadProfile();

    // Updates when Settings saves the profile in this tab.
    window.addEventListener("spendly-profile-updated", loadProfile);

    // Updates when localStorage changes in another tab.
    window.addEventListener("storage", loadProfile);

    return () => {
      window.removeEventListener("spendly-profile-updated", loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-100 bg-white p-5 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <Leaf size={21} />
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              spendly<span className="text-emerald-700">.</span>
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-10">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href ||
                    pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  {label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-700" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-gray-100 px-2 pt-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
            {initials || "SU"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {userName}
            </p>
            <p className="text-xs text-gray-400">
              Personal workspace
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
