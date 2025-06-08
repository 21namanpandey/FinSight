"use client";

import React from "react";
import { toast } from "sonner";
import { BudgetForm } from "@/components/budget-form";
import { BudgetList } from "@/components/budget-list";
import { BudgetVsActualChart } from "@/components/charts/budget-vs-actual-chart";
import { Budget, BudgetFormData, Transaction } from "@/types/transaction";

export default function BudgetPage() {
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  // Load data from API on mount
  React.useEffect(() => {
    loadBudgets();
    loadTransactions();
  }, []);

  const loadBudgets = async () => {
    try {
      const response = await fetch("/api/budgets");
      if (response.ok) {
        const result = await response.json();
        setBudgets(result.data || []);
      } else {
        console.error("Failed to load budgets");
        toast.error("Failed to load budgets");
      }
    } catch (error) {
      console.error("Error loading budgets:", error);
      toast.error("Error loading budgets");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data || []);
      } else {
        console.error("Failed to load transactions");
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const handleAddBudget = async (data: BudgetFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setBudgets((prev) => [
          result.data,
          ...prev.filter(
            (b) =>
              !(
                b.category === result.data.category &&
                b.month === result.data.month
              )
          ),
        ]);
        toast.success("Budget set successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create budget");
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Error creating budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBudget = async (data: BudgetFormData) => {
    if (!editingBudget) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setBudgets((prev) =>
          prev.map((budget) =>
            budget.id === editingBudget.id ? result.data : budget
          )
        );
        setEditingBudget(null);
        toast.success("Budget updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update budget");
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Error updating budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBudgets((prev) => prev.filter((budget) => budget.id !== id));
        toast.success("Budget deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete budget");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Error deleting budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
  };

  if (initialLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            Budget Management
          </h1>
          <p className="text-muted-foreground">
            Set and track your spending limits
          </p>
        </div>

        {/* Budget vs Actual Chart */}
        {budgets.length > 0 && (
          <BudgetVsActualChart budgets={budgets} transactions={transactions} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Budget Form */}
          <div className="order-1 lg:order-1">
            <BudgetForm
              onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
              editingBudget={editingBudget}
              onCancelEdit={handleCancelEdit}
              isLoading={isLoading}
              existingBudgets={budgets}
            />
          </div>

          {/* Budget List */}
          <div className="order-2 lg:order-2">
            <BudgetList
              budgets={budgets}
              transactions={transactions}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
