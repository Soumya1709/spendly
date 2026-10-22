
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Tags,
  Settings,
  CircleHelp,
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

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

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

        <div className="mt-auto rounded-2xl bg-emerald-50 p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700">
            <CircleHelp size={19} />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Need a hand?
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Keep your finances organized with Spendly.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 px-2 pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
            SS
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              My Account
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
