"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Budget, BudgetFormData, CATEGORIES } from "@/types/transaction";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0.01, "Amount must be positive").max(999999, "Amount too large"),
  month: z.string().min(1, "Month is required"),
});

interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => void;
  editingBudget?: Budget | null;
  onCancelEdit?: () => void;
  isLoading?: boolean;
  existingBudgets?: Budget[];
}

export function BudgetForm({ 
  onSubmit, 
  editingBudget, 
  onCancelEdit,
  isLoading = false,
  existingBudgets = []
}: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: 0,
      month: format(new Date(), "yyyy-MM"),
    },
  });

  const watchedCategory = watch("category");
  const watchedMonth = watch("month");

  React.useEffect(() => {
    if (editingBudget) {
      setValue("category", editingBudget.category);
      setValue("amount", editingBudget.amount);
      setValue("month", editingBudget.month);
    } else {
      reset({
        category: "",
        amount: 0,
        month: format(new Date(), "yyyy-MM"),
      });
    }
  }, [editingBudget, setValue, reset]);

  const handleFormSubmit = (data: BudgetFormData) => {
    onSubmit(data);
    if (!editingBudget) {
      reset({
        category: "",
        amount: 0,
        month: format(new Date(), "yyyy-MM"),
      });
    }
  };

  const handleCancel = () => {
    reset({
      category: "",
      amount: 0,
      month: format(new Date(), "yyyy-MM"),
    });
    onCancelEdit?.();
  };

  const availableCategories = CATEGORIES.filter(category => {
    if (editingBudget && category === editingBudget.category) return true;
    return !existingBudgets.some(budget => 
      budget.category === category && budget.month === watchedMonth
    );
  });

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          {editingBudget ? (
            <>
              <Edit3 className="h-5 w-5 text-emerald-600" />
              Edit Budget
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 text-emerald-600" />
              Set Budget
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={watchedCategory}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger className={cn(
                "transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20",
                errors.category && "border-red-500 focus:ring-red-500/20"
              )}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Budget Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                className={cn(
                  "pl-8 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20",
                  errors.amount && "border-red-500 focus:ring-red-500/20"
                )}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm font-medium">
              Month
            </Label>
            <Input
              id="month"
              type="month"
              {...register("month")}
              className={cn(
                "transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20",
                errors.month && "border-red-500 focus:ring-red-500/20"
              )}
            />
            {errors.month && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.month.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={!isValid || isLoading || availableCategories.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {editingBudget ? "Updating..." : "Setting..."}
                </div>
              ) : (
                <>
                  {editingBudget ? (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Update Budget
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Set Budget
                    </>
                  )}
                </>
              )}
            </Button>
            {editingBudget && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="transition-all duration-200 hover:bg-muted/50"
              >
                Cancel
              </Button>
            )}
          </div>
          {availableCategories.length === 0 && !editingBudget && (
            <p className="text-sm text-muted-foreground text-center">
              All categories already have budgets for this month
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}