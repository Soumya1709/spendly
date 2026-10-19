"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSwapy, utils } from "swapy";
import { GripVertical } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ExpenseForm from "./ExpenseForm";
import { CATEGORIES, inr } from "@/lib/constants";

ChartJS.register(ArcElement, Tooltip, Legend);

// Each id is also the initial slot id. The className is the SLOT size.
// Slots keep their size and the cards move between them, so the grid never breaks.
const ITEMS = [
  { id: "total",  className: "lg:col-span-4 sm:col-span-6 col-span-12" },
  { id: "budget", className: "lg:col-span-4 sm:col-span-6 col-span-12" },
  { id: "top",    className: "lg:col-span-4 sm:col-span-12 col-span-12" },
  { id: "form",   className: "lg:col-span-5 sm:col-span-7 col-span-12" },
  { id: "chart",  className: "lg:col-span-4 sm:col-span-5 col-span-12" },
  { id: "stats",  className: "lg:col-span-3 sm:col-span-12 col-span-12" },
];

const LAYOUT_KEY = "layout";

function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY));
    const valid =
      Array.isArray(saved) &&
      saved.length === ITEMS.length &&
      saved.every(
        (s) => ITEMS.some((i) => i.id === s.slot) && ITEMS.some((i) => i.id === s.item)
      );
    if (valid) return saved;
  } catch {}
  return utils.initSlotItemMap(ITEMS, "id");
}

function Card({ className = "", children }) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl p-5 shadow-md ${className}`}
    >
      <span
        data-swapy-handle
        className="absolute right-3 top-3 cursor-grab opacity-60 hover:opacity-100 active:cursor-grabbing"
        title="Drag to move"
      >
        <GripVertical size={18} />
      </span>
      {children}
    </div>
  );
}

export default function Dashboard({
  expenses, thisMonth, budget, setBudget, onSave, editing, onCancelEdit,
}) {
  // Dashboard only mounts after localStorage has loaded, so reading it here is safe
  const [slotItemMap, setSlotItemMap] = useState(loadLayout);
  const containerRef = useRef(null);
  const swapyRef = useRef(null);

  const slottedItems = useMemo(
    () => utils.toSlottedItems(ITEMS, "id", slotItemMap),
    [slotItemMap]
  );

  useEffect(() => {
    swapyRef.current = createSwapy(containerRef.current, {
      manualSwap: true,
      swapMode: "hover",
      animation: "dynamic",
    });

    swapyRef.current.onSwap((event) => {
      requestAnimationFrame(() => {
        const next = event.newSlotItemMap.asArray;
        setSlotItemMap(next);
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
      });
    });

    return () => swapyRef.current?.destroy();
  }, []);

  // ---- derived stats ----
  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const largest = expenses.reduce((m, e) => (e.amount > m ? e.amount : m), 0);
    return {
      total,
      count: expenses.length,
      entries,
      top: entries[0],
      average: expenses.length ? total / expenses.length : 0,
      largest,
    };
  }, [expenses]);

  const pct = budget > 0 ? Math.min(100, (thisMonth / budget) * 100) : 0;
  const over = budget > 0 && thisMonth > budget;

  const widgets = {
    total: (
      <Card className="items-center justify-center bg-emerald-600 text-center text-yellow-200">
        <p className="font-medium">Total spent</p>
        <h2 className="my-1 text-5xl font-bold">{inr(stats.total)}</h2>
        <p className="text-sm text-yellow-200/80">
          {stats.count} transaction{stats.count === 1 ? "" : "s"}
        </p>
      </Card>
    ),

    budget: (
      <Card className="justify-center bg-yellow-200 text-neutral-900">
        <p className="font-medium">Budget this month</p>
        <div className="my-1 flex items-baseline gap-2">
          <h2 className="text-4xl font-bold">{inr(thisMonth)}</h2>
          <span className="text-sm text-neutral-600">of</span>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
            className="w-24 rounded-md bg-white/70 px-2 py-1 text-sm outline-none"
            aria-label="Monthly budget"
          />
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              over ? "bg-red-500" : "bg-emerald-600"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`mt-2 text-sm font-medium ${over ? "text-red-600" : "text-neutral-700"}`}>
          {over
            ? `Over budget by ${inr(thisMonth - budget)}`
            : `${inr(Math.max(budget - thisMonth, 0))} left`}
        </p>
      </Card>
    ),

    top: (
      <Card className="justify-center bg-purple-300 text-neutral-900">
        <p className="font-medium">Top category</p>
        <h2 className="my-1 text-4xl font-bold">{stats.top ? stats.top[0] : "—"}</h2>
        {stats.top && (
          <p className="font-medium text-neutral-700">
            {inr(stats.top[1])} · {((stats.top[1] / stats.total) * 100).toFixed(0)}% of spending
          </p>
        )}
      </Card>
    ),

    form: (
      <Card className="bg-blue-600 text-white">
        <ExpenseForm onSave={onSave} editing={editing} onCancel={onCancelEdit} />
      </Card>
    ),

    chart: (
      <Card className="bg-pink-200 text-neutral-900">
        <p className="font-medium">By category</p>
        {stats.entries.length === 0 ? (
          <p className="m-auto text-sm text-neutral-600">No data yet</p>
        ) : (
          <div className="relative mt-2 min-h-0 flex-1">
            <Doughnut
              data={{
                labels: stats.entries.map(([c]) => c),
                datasets: [
                  {
                    data: stats.entries.map(([, v]) => v),
                    backgroundColor: stats.entries.map(([c]) => CATEGORIES[c]),
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } },
              }}
            />
          </div>
        )}
      </Card>
    ),

    stats: (
      <Card className="justify-center bg-zinc-700 text-yellow-200">
        <p className="font-medium">Average expense</p>
        <h2 className="text-3xl font-bold">{inr(stats.average)}</h2>
        <p className="mt-4 font-medium">Largest expense</p>
        <h2 className="text-3xl font-bold">{inr(stats.largest)}</h2>
      </Card>
    ),
  };

  return (
    <div ref={containerRef} className="grid grid-cols-12 gap-4 md:gap-6">
      {slottedItems.map(({ slotId, itemId }) => {
        const slot = ITEMS.find((i) => i.id === slotId);
        return (
          <div
            key={slotId}
            data-swapy-slot={slotId}
            className={`h-72 ${slot.className}`}
          >
            <div key={itemId} data-swapy-item={itemId} className="h-full w-full">
              {widgets[itemId]}
            </div>
          </div>
        );
      })}
    </div>
  );
}