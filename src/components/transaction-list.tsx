"use client";

import * as React from "react";
import { PlusCircle, MinusCircle, Pencil, Trash2, ListX } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  category: string;
  amount: number;
  date: string;
};

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function TransactionList({ transactions, onEditTransaction, onDeleteTransaction }: TransactionListProps) {
  const [filter, setFilter] = React.useState<"all" | "income" | "expense">("all");

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  return (
    <Card className="w-full bg-background font-sans">
      <CardHeader className="flex flex-col gap-4 border-b border-border md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <CardTitle className="text-xl font-semibold text-foreground">Transactions</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">View and manage all your income and expenses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "income" ? "default" : "outline"} size="sm" onClick={() => setFilter("income")}>
            Income
          </Button>
          <Button variant={filter === "expense" ? "default" : "outline"} size="sm" onClick={() => setFilter("expense")}>
            Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredTransactions.length > 0 ? (
          <ul className="divide-y divide-border">
            {filteredTransactions.map((transaction) => (
              <li key={transaction.id} className="group transition-colors hover:bg-accent">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4">
                  <div className="flex flex-1 items-center gap-4 min-w-[100px]">
                    <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", transaction.type === "income" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                      {transaction.type === "income" ? <PlusCircle className="h-5 w-5" aria-label="Income" /> : <MinusCircle className="h-5 w-5" aria-label="Expense" />}
                    </div>
                    <div>
                      <p className="truncate font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-32 text-right">
                      <p className={cn("font-semibold", transaction.type === "income" ? "text-primary" : "text-destructive")}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="flex shrink-0 items-center transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => onEditTransaction(transaction)} aria-label={`Edit transaction for ${transaction.description}`}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteTransaction(transaction)} aria-label={`Delete transaction for ${transaction.description}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <ListX className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No Transactions Found</p>
            <p className="text-sm text-muted-foreground">Your transactions will appear here once you add them.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
