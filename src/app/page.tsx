"use client";

import React, { useState, useEffect } from "react";
import ExpenseTrackerLayout, { type ActiveView } from "@/components/expense-tracker-layout";
import DashboardOverview, { DashboardTransaction } from "@/components/dashboard-overview";
import TransactionList from "@/components/transaction-list";
import TransactionForm, { type TransactionData } from "@/components/transaction-form";
import { useTransactionStorage, type Transaction } from "@/components/transaction-storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
export default function Home() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getFilteredTransactions, loading } = useTransactionStorage();

  // Utility to determine if two dates are in the same month (and year)
  const isSameMonthYear = (dateA: Date, dateB: Date) => dateA.getMonth() === dateB.getMonth() && dateA.getFullYear() === dateB.getFullYear();

  // --- Compute Dashboard Metrics based on real transactions ---
  const now = new Date();

  // Filter to only consider transactions for this month (in local time!)
  const thisMonthTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);
    return isSameMonthYear(txDate, now);
  });

  const monthlyIncome = thisMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = thisMonthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = transactions.reduce((sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount), 0);

  // Get most recent 5 transactions (sorted DESC by date)
  const recentTransactions: DashboardTransaction[] = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((t) => ({ ...t }));

  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);
  const [defaultFormType, setDefaultFormType] = useState<"income" | "expense">("expense");

  // App-level controlled navigation state
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  // Alert Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Handle activeView changes
  useEffect(() => {
    // When user navigates to a view that is not the form, cancel any pending edit.
    if (activeView !== "add" && editingTransaction) {
      setEditingTransaction(null);
    }
  }, [activeView, editingTransaction]);
  const handleEditClick = (transaction: Transaction) => {
    const transactionForForm: TransactionData = {
      ...transaction,
      date: new Date(transaction.date),
    };
    setEditingTransaction(transactionForForm);
    setDefaultFormType(transactionForForm.type);
    setActiveView("add");
  };

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setTransactionToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleCancelForm = () => {
    setEditingTransaction(null);
    setActiveView("dashboard"); // Always go back to dashboard, better UX
  };

  const handleFormSubmit = async (data: Omit<TransactionData, "id">) => {
    const transactionPayload = {
      ...data,
      date: data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString(),
      amount: Number(data.amount),
    };

    if (editingTransaction?.id) {
      updateTransaction(editingTransaction.id, transactionPayload);
    } else {
      addTransaction(transactionPayload);
    }

    setEditingTransaction(null);
    setActiveView("dashboard"); // Redirect back to dashboard
  };

  // Add Income/Expense button handlers
  const handleAddIncome = () => {
    setEditingTransaction(null);
    setDefaultFormType("income");
    setActiveView("add");
  };
  const handleAddExpense = () => {
    setEditingTransaction(null);
    setDefaultFormType("expense");
    setActiveView("add");
  };

  const renderContent = (activeView: ActiveView) => {
    switch (activeView) {
      case "dashboard":
        return <DashboardOverview balance={balance} monthlyIncome={monthlyIncome} monthlyExpenses={monthlyExpenses} recentTransactions={recentTransactions} onAddIncome={handleAddIncome} onAddExpense={handleAddExpense} />;
      case "transactions":
        return (
          <div className="relative">
            <TransactionList transactions={getFilteredTransactions({ sortBy: "date", sortOrder: "desc" })} onEditTransaction={handleEditClick} onDeleteTransaction={handleDelete} />
          </div>
        );
      case "add":
        return (
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-2">{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</h1>
            <p className="mb-6 text-sm text-muted-foreground">{editingTransaction ? "Update the details of your transaction below." : "Fill out the form to add a new expense or income."}</p>
            <TransactionForm
              key={editingTransaction?.id || defaultFormType}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              transaction={editingTransaction || (defaultFormType ? { type: defaultFormType, amount: "", description: "", category: "", date: new Date() } : undefined)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Loading Your Financials...</p>
      </div>
    );
  }

  return (
    <>
      <ExpenseTrackerLayout defaultView="dashboard" activeView={activeView} onViewChange={setActiveView}>
        {(activeView) => renderContent(activeView)}
      </ExpenseTrackerLayout>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi "{transactionToDelete?.description}"?
              Tindakan ini tidak dapat dibatalkan dan akan menghapus transaksi secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
