"use client";

import React from "react";
import { toast } from "sonner";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { Transaction, TransactionFormData } from "@/types/transaction";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    React.useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = React.useState({
    category: "",
    month: "",
  });

  // Load transactions from API
  const loadTransactions = React.useCallback(
    async (page = 1, category = "", month = "") => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        if (category) params.append("category", category);
        if (month) params.append("month", month);

        const response = await fetch(`/api/transactions?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();

        if (data.success) {
          setTransactions(data.data.transactions);
          setPagination(data.data.pagination);
        } else {
          throw new Error(data.error || "Failed to load transactions");
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
        toast.error("Failed to load transactions");
      } finally {
        setIsInitialLoading(false);
      }
    },
    [pagination.limit]
  );

  // Initial load
  React.useEffect(() => {
    loadTransactions();
  }, []);

  // Reload when filters change
  React.useEffect(() => {
    if (!isInitialLoading) {
      loadTransactions(1, filters.category, filters.month);
    }
  }, [filters, loadTransactions, isInitialLoading]);

  const handleAddTransaction = async (data: TransactionFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to add transaction");
      }

      // Reload transactions to get updated list
      await loadTransactions(1, filters.category, filters.month);
      toast.success("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/transactions/${editingTransaction.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update transaction");
      }

      // Reload transactions to get updated list
      await loadTransactions(pagination.page, filters.category, filters.month);
      setEditingTransaction(null);
      toast.success("Transaction updated successfully!");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete transaction");
      }

      // Reload transactions to get updated list
      await loadTransactions(pagination.page, filters.category, filters.month);
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handlePageChange = (newPage: number) => {
    loadTransactions(newPage, filters.category, filters.month);
  };

  const handleFilterChange = (newFilters: {
    category?: string;
    month?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (isInitialLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            Manage your income and expenses ({pagination.total} total)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction Form */}
          <div className="order-1 lg:order-1">
            <TransactionForm
              onSubmit={
                editingTransaction
                  ? handleUpdateTransaction
                  : handleAddTransaction
              }
              editingTransaction={editingTransaction}
              onCancelEdit={handleCancelEdit}
              isLoading={isLoading}
            />
          </div>

          {/* Transaction List */}
          <div className="order-2 lg:order-2">
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={handlePageChange}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
