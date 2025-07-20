"use client";

import * as React from "react";
import { ArrowDownCircle, ArrowUpCircle, CreditCard, DollarSign, Fuel, PlusCircle, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardTransaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string; // ISO String
  category?: string;
};

interface DashboardOverviewProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: DashboardTransaction[];
  onAddIncome?: () => void;
  onAddExpense?: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getIcon = (type: string, category?: string) => {
  if (type === "income") return DollarSign;

  // Optionally provide different icons for categories
  if (category) {
    const lowerCategory = category.toLowerCase();

    // Transportasi
    if (lowerCategory.includes("bensin") || lowerCategory.includes("bbm") || lowerCategory.includes("transport") || lowerCategory.includes("transportasi") || lowerCategory.includes("ojek") || lowerCategory.includes("grab") || lowerCategory.includes("gojek")) return Fuel;

    // Belanja
    if (lowerCategory.includes("belanja") || lowerCategory.includes("shopping") || lowerCategory.includes("toko") || lowerCategory.includes("mall") || lowerCategory.includes("market")) return ShoppingBag;

    // Kartu Kredit/Debit
    if (lowerCategory.includes("kartu") || lowerCategory.includes("credit") || lowerCategory.includes("debit") || lowerCategory.includes("atm") || lowerCategory.includes("transfer")) return CreditCard;

    // Makanan
    if (lowerCategory.includes("makan") || lowerCategory.includes("makanan") || lowerCategory.includes("restoran") || lowerCategory.includes("warung") || lowerCategory.includes("cafe") || lowerCategory.includes("kopi")) return ShoppingBag;

    // Hiburan
    if (lowerCategory.includes("hiburan") || lowerCategory.includes("film") || lowerCategory.includes("game") || lowerCategory.includes("nonton") || lowerCategory.includes("konser")) return ShoppingBag;

    // Tagihan
    if (lowerCategory.includes("tagihan") || lowerCategory.includes("listrik") || lowerCategory.includes("air") || lowerCategory.includes("internet") || lowerCategory.includes("pulsa") || lowerCategory.includes("wifi")) return CreditCard;

    // Kesehatan
    if (lowerCategory.includes("obat") || lowerCategory.includes("dokter") || lowerCategory.includes("rumah sakit") || lowerCategory.includes("apotek") || lowerCategory.includes("kesehatan")) return ShoppingBag;

    // Pendidikan
    if (lowerCategory.includes("sekolah") || lowerCategory.includes("kuliah") || lowerCategory.includes("buku") || lowerCategory.includes("pendidikan") || lowerCategory.includes("kursus")) return ShoppingBag;
  }

  return ArrowUpCircle;
};

export default function DashboardOverview({ balance, monthlyIncome, monthlyExpenses, recentTransactions, onAddIncome, onAddExpense }: DashboardOverviewProps) {
  const balanceColor = balance >= 0 ? "text-primary" : "text-destructive";

  return (
    <main className="flex-1 space-y-6 bg-secondary p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here is a summary of your financial activity.</p>
          </div>
          <div className="flex w-1/2 shrink-0 gap-2 sm:w-auto">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto" onClick={onAddIncome} type="button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Income
            </Button>
            <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto" onClick={onAddExpense} type="button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardDescription>Current Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <h2 className={cn("text-4xl font-extrabold tracking-tighter sm:text-5xl", balanceColor)}>{formatCurrency(balance)}</h2>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month's Income</CardTitle>
                <ArrowDownCircle className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(monthlyIncome)}</div>
                <p className="text-xs text-muted-foreground">Total earnings for the current month.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month's Expenses</CardTitle>
                <ArrowUpCircle className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(monthlyExpenses)}</div>
                <p className="text-xs text-muted-foreground">Total spending for the current month.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Here are your last 5 financial activities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => {
                  const Icon = getIcon(transaction.type, transaction.category);
                  const txDate = new Date(transaction.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div key={transaction.id} className={`flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-secondary ${index !== recentTransactions.length - 1 ? "border-b" : ""}`}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{txDate}</p>
                      </div>
                      <div className={cn("text-right font-semibold", transaction.type === "income" ? "text-primary" : "text-destructive")}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground py-4 px-2">No recent transactions.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
