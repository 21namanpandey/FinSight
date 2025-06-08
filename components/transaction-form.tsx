"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Transaction,
  TransactionFormData,
  CATEGORIES,
} from "@/types/transaction";

const transactionSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Description too long"),
  amount: z
    .number()
    .min(0.01, "Amount must be positive")
    .max(999999, "Amount too large"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  onSubmit,
  editingTransaction,
  onCancelEdit,
  isLoading = false,
}: TransactionFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      category: "",
    },
  });

  const watchedDate = watch("date");
  const watchedCategory = watch("category");

  React.useEffect(() => {
    if (editingTransaction) {
      setValue("description", editingTransaction.description);
      setValue("amount", editingTransaction.amount);
      // Handle date formatting - ensure it's in YYYY-MM-DD format
      const date = new Date(editingTransaction.date);
      setValue("date", format(date, "yyyy-MM-dd"));
      setValue("category", editingTransaction.category);
    } else {
      reset({
        description: "",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        category: "",
      });
    }
  }, [editingTransaction, setValue, reset]);

  const handleFormSubmit = (data: TransactionFormData) => {
    // Ensure date is properly formatted for the API
    const formattedData = {
      ...data,
      date: format(new Date(data.date), "yyyy-MM-dd"),
    };

    onSubmit(formattedData);

    if (!editingTransaction) {
      reset({
        description: "",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        category: "",
      });
    }
  };

  const handleCancel = () => {
    reset({
      description: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      category: "",
    });
    onCancelEdit?.();
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          {editingTransaction ? (
            <>
              <Edit3 className="h-5 w-5 text-emerald-600" />
              Edit Transaction
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Transaction
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Enter transaction description"
              {...register("description")}
              className={cn(
                "transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20",
                errors.description && "border-red-500 focus:ring-red-500/20"
              )}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={watchedCategory}
              onValueChange={(value) => setValue("category", value)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={cn(
                  "transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20",
                  errors.category && "border-red-500 focus:ring-red-500/20"
                )}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
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
              Amount
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
                disabled={isLoading}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-200 hover:bg-muted/50",
                    !watchedDate && "text-muted-foreground",
                    errors.date && "border-red-500"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedDate ? (
                    format(new Date(watchedDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedDate ? new Date(watchedDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setValue("date", format(date, "yyyy-MM-dd"));
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.date.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {editingTransaction ? "Updating..." : "Adding..."}
                </div>
              ) : (
                <>
                  {editingTransaction ? (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Update Transaction
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </>
                  )}
                </>
              )}
            </Button>
            {editingTransaction && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="transition-all duration-200 hover:bg-muted/50"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
