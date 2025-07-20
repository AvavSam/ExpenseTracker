"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================================================
// Constants & Type Definitions
// ============================================================================

const TRANSACTIONS_STORAGE_KEY = "expense-tracker-transactions";

/**
 * Defines the type of a transaction.
 */
export type TransactionType = "income" | "expense";

/**
 * Represents a single financial transaction.
 * Dates are stored as ISO 8601 strings (e.g., "2023-10-27") for consistency.
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
}

/**
 * Type for creating a new transaction, omitting the auto-generated 'id'.
 */
export type NewTransaction = Omit<Transaction, "id">;

/**
 * Represents the calculated financial totals.
 */
export interface Totals {
  balance: number;
  income: number;
  expense: number;
}

/**
 * Defines the options for filtering and sorting transactions.
 */
export interface FilterOptions {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  category?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Main Hook: useTransactionStorage
// ============================================================================

/**
 * A custom hook for managing transaction data with localStorage persistence.
 * It provides a complete API for CRUD operations, financial calculations,
 * and advanced filtering, while encapsulating all persistence logic.
 *
 * @returns An object containing the transaction state and management functions.
 */
export const useTransactionStorage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Effects for Data Persistence ---

  // Effect for initial loading from localStorage on component mount.
  useEffect(() => {
    // This code runs only on the client side.
    try {
      const storedData = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (storedData) {
        const parsedData: Transaction[] = JSON.parse(storedData);
        // Basic validation can be added here if needed (e.g., with Zod).
        setTransactions(parsedData);
      }
    } catch (err) {
      console.error("Failed to load transactions from localStorage:", err);
      setError("Could not load transaction data. Your browser might not support or allow localStorage.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once.

  // Effect for saving to localStorage whenever the transactions state changes.
  useEffect(() => {
    // Avoid writing to localStorage during the initial hydration phase.
    if (!loading) {
      try {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
        // Clear any previous storage-related errors on a successful save.
        if (error) setError(null);
      } catch (err) {
        console.error("Failed to save transactions to localStorage:", err);
        setError("Could not save your changes. The data might not be persisted.");
      }
    }
  }, [transactions, loading, error]);

  // --- CRUD Operations ---

  /**
   * Adds a new transaction to the list and persists the change.
   * @param newTransaction - The transaction data to add (without an ID).
   */
  const addTransaction = useCallback((newTransaction: NewTransaction) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [...prev, transaction]);
  }, []);

  /**
   * Updates an existing transaction by its ID.
   * @param id - The ID of the transaction to update.
   * @param updatedData - An object with the fields to update.
   */
  const updateTransaction = useCallback((id: string, updatedData: Partial<NewTransaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t)));
  }, []);

  /**
   * Deletes a transaction by its ID.
   * @param id - The ID of the transaction to delete.
   */
  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Data Computation & Filtering ---

  /**
   * Calculates the total income, expenses, and current balance.
   * Memoized with useMemo for performance, recalculating only when transactions change.
   */
  const totals = useMemo<Totals>(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { balance: 0, income: 0, expense: 0 }
    );
  }, [transactions]);

  /**
   * Returns a filtered and sorted list of transactions based on provided options.
   * This function does not modify the master transaction list.
   * @param options - The filtering and sorting criteria.
   * @returns A new array of transactions that match the criteria.
   */
  const getFilteredTransactions = useCallback(
    (options?: FilterOptions): Transaction[] => {
      let filtered = [...transactions];

      if (options) {
        if (options.type) {
          filtered = filtered.filter((t) => t.type === options.type);
        }
        if (options.category && options.category.toLowerCase() !== "all") {
          filtered = filtered.filter((t) => t.category.toLowerCase() === options.category?.toLowerCase());
        }
        if (options.startDate) {
          const start = new Date(options.startDate);
          filtered = filtered.filter((t) => new Date(t.date) >= start);
        }
        if (options.endDate) {
          const end = new Date(options.endDate);
          const dayAfterEnd = new Date(end);
          dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
          filtered = filtered.filter((t) => new Date(t.date) < dayAfterEnd);
        }

        const sortBy = options.sortBy;
        const sortOrder = options.sortOrder || "desc";

        if (sortBy) {
          filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === "date") {
              comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (sortBy === "amount") {
              comparison = b.amount - a.amount;
            }
            return sortOrder === "asc" ? -comparison : comparison;
          });
        }
      }

      // Default sort by date descending if no sorting is specified
      if (!options?.sortBy) {
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      return filtered;
    },
    [transactions]
  );

  // --- Hook Return Value ---

  return {
    transactions, // The raw list of all transactions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totals, // Memoized total calculations
    getFilteredTransactions, // Function to get a derived list
    loading, // Boolean for initial data hydration
    error, // Error message string
  };
};
