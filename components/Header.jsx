
"use client";

import { Bell, Menu, Search } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-100 bg-white/90 px-5 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm font-medium text-gray-900">
            Personal Finance
          </p>
          <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">
            Take control of your money
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          aria-label="Search"
          className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
        >
          <Search size={19} />
        </button>

        <button
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
        >
          <Bell size={19} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
          SS
        </div>
      </div>
    </header>
  );
}
