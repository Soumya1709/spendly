
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const TransactionContext = createContext(null);

const STORAGE_KEY = "spendly_transactions";

export function TransactionProvider({ children }) {
  const [transactions, setTransactionsState] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load transactions once when the app starts.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        setTransactionsState(
          Array.isArray(parsed) ? parsed : []
        );
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist every transaction update.
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Failed to save transactions:", error);
    }
  }, [transactions, isLoaded]);

  // Keep other browser tabs synchronized.
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== STORAGE_KEY) return;

      try {
        const parsed = event.newValue
          ? JSON.parse(event.newValue)
          : [];

        setTransactionsState(
          Array.isArray(parsed) ? parsed : []
        );
      } catch (error) {
        console.error("Failed to sync transactions:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const addTransaction = useCallback((transaction) => {
    const newTransaction = {
      ...transaction,
      id:
        transaction.id ||
        (typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`),
    };

    setTransactionsState((previous) => [
      newTransaction,
      ...previous,
    ]);

    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id, updates) => {
    setTransactionsState((previous) =>
      previous.map((transaction) =>
        String(transaction.id) === String(id)
          ? { ...transaction, ...updates }
          : transaction
      )
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactionsState((previous) =>
      previous.filter(
        (transaction) =>
          String(transaction.id) !== String(id)
      )
    );
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactionsState([]);
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        setTransactions: setTransactionsState,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        clearTransactions,
        isLoaded,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      "useTransactions must be used inside TransactionProvider"
    );
  }

  return context;
}
