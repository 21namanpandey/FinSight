"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import {
  Edit,
  Trash2,
  IndianRupee,
  Calendar,
  Target,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Budget, Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function BudgetList({
  budgets,
  transactions,
  onEdit,
  onDelete,
  isLoading = false,
}: BudgetListProps) {
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const getBudgetSpending = (budget: Budget) => {
    const monthTransactions = safeTransactions.filter((transaction) => {
      try {
        // Handle both string and Date objects for transaction.date
        const transactionDate =
          typeof transaction.date === "string"
            ? parseISO(transaction.date)
            : new Date(transaction.date);

        const transactionMonth = format(transactionDate, "yyyy-MM");
        return (
          transactionMonth === budget.month &&
          transaction.category === budget.category
        );
      } catch (error) {
        console.error("Error parsing transaction date:", error);
        return false;
      }
    });

    return monthTransactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amount),
      0
    );
  };

  const getBudgetStatus = (budget: Budget, spent: number) => {
    const percentage = (spent / budget.amount) * 100;
    if (percentage >= 100)
      return {
        status: "exceeded",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      };
    if (percentage >= 80)
      return {
        status: "warning",
        color: "text-amber-600",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
      };
    return {
      status: "good",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    };
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600/30 border-t-emerald-600" />
            <span className="ml-3 text-muted-foreground">
              Loading budgets...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Target className="h-5 w-5 text-emerald-600" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Target className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No budgets set
            </p>
            <p className="text-sm text-muted-foreground">
              Create your first budget to track spending!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = getBudgetSpending(budget);
              const remaining = budget.amount - spent;
              const percentage = Math.min((spent / budget.amount) * 100, 100);
              const status = getBudgetStatus(budget, spent);

              return (
                <div
                  key={budget.id}
                  className="p-4 rounded-lg border bg-background/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {budget.category}
                      </h3>
                      <Badge
                        className={cn("text-xs", status.bgColor, status.color)}
                      >
                        {status.status === "exceeded" && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {status.status === "exceeded"
                          ? "Over Budget"
                          : status.status === "warning"
                          ? "Near Limit"
                          : "On Track"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(`${budget.month}-01`), "MMM yyyy")}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ₹{spent.toLocaleString("en-IN")}</span>
                      <span>
                        Budget: ₹{budget.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className={cn(
                        "h-2",
                        status.status === "exceeded"
                          ? "bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-600"
                          : status.status === "warning"
                          ? "bg-amber-100 dark:bg-amber-900/30 [&>div]:bg-amber-600"
                          : "bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-600"
                      )}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span
                        className={cn(
                          "font-medium",
                          remaining >= 0 ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {remaining >= 0 ? "Remaining" : "Over"}: ₹
                        {Math.abs(remaining).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(budget)}
                      className="h-8 transition-all duration-200 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                      <Edit className="h-4 w-4 text-emerald-600 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 transition-all duration-200 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this budget? This
                            action cannot be undone.
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="font-medium">{budget.category}</p>
                              <p className="text-sm text-muted-foreground">
                                ₹{budget.amount.toLocaleString("en-IN")} •{" "}
                                {format(
                                  parseISO(`${budget.month}-01`),
                                  "MMM yyyy"
                                )}
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(budget.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
