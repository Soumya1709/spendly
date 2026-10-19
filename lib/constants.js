export const CATEGORIES = {
  Food: "#f59e0b",
  Travel: "#3b82f6",
  Utilities: "#10b981",
  Shopping: "#ec4899",
  Health: "#ef4444",
  Other: "#8b5cf6",
};

export const inr = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Local date as YYYY-MM-DD (toISOString would use UTC and can be off by a day)
export const today = () => new Date().toLocaleDateString("en-CA");

export const monthKey = (date) => date.slice(0, 7); // "2026-10"

export const monthLabel = (key) =>
  new Date(key + "-01T00:00").toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

export const formatDate = (date) =>
  new Date(date + "T00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });