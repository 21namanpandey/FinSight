"use client";

import React from "react";
import { format } from "date-fns";
import {
  Edit,
  Trash2,
  IndianRupee,
  Calendar,
  FileText,
  Tag,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Transaction, CATEGORIES } from "@/types/transaction";
import { cn } from "@/lib/utils";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TransactionFilters {
  category: string;
  month: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  showSummary?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  filters?: TransactionFilters;
  onFilterChange?: (filters: { category?: string; month?: string }) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Food & Dining":
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Transportation:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Shopping:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Entertainment:
      "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    "Bills & Utilities":
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    Healthcare:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Travel: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    Education:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    Groceries:
      "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
    Rent: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };
  return colors[category] || colors["Other"];
};

const Pagination = ({
  currentPage,
  totalPages,
  total,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <div className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * 50 + 1} to{" "}
        {Math.min(currentPage * 50, total)} of {total} transactions
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn(
              "h-8 w-8 p-0",
              page === currentPage && "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  isLoading = false,
  showSummary = true,
  pagination,
  onPageChange,
  filters,
  onFilterChange,
}: TransactionListProps) {
  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const handleFilterChange = (type: "category" | "month", value: string) => {
    if (onFilterChange) {
      onFilterChange({ [type]: value });
    }
  };

  const clearFilters = () => {
    if (onFilterChange) {
      onFilterChange({ category: "", month: "" });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600/30 border-t-emerald-600" />
            <span className="ml-3 text-muted-foreground">
              Loading transactions...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5 text-emerald-600" />
            Transactions
            {pagination && (
              <Badge variant="secondary" className="ml-2">
                {pagination.total}
              </Badge>
            )}
          </CardTitle>
          {showSummary && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Page Balance</p>
              <p
                className={cn(
                  "text-2xl font-bold flex items-center gap-1",
                  totalAmount >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                <IndianRupee className="h-5 w-5" />
                {Math.abs(totalAmount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        {onFilterChange && (
          <div className="flex flex-wrap gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filters:</Label>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select
                value={filters?.category || ""}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Input
                type="month"
                value={filters?.month || ""}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                className="h-8"
                placeholder="Filter by month"
              />
            </div>

            {(filters?.category || filters?.month) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <IndianRupee className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-muted-foreground mb-2">
              {filters?.category || filters?.month
                ? "No transactions found"
                : "No transactions yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {filters?.category || filters?.month
                ? "Try adjusting your filters or add a new transaction."
                : "Add your first transaction to get started!"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold text-right">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow
                      key={transaction.id}
                      className={cn(
                        "transition-all duration-150 hover:bg-muted/30",
                        index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs",
                            getCategoryColor(transaction.category)
                          )}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-semibold flex items-center justify-end gap-1",
                            transaction.amount >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          )}
                        >
                          <IndianRupee className="h-4 w-4" />
                          {Math.abs(transaction.amount).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(transaction)}
                            className="h-8 w-8 p-0 transition-all duration-200 hover:bg-emerald-50 hover:border-emerald-300 hover:scale-110"
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:scale-110"
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Transaction
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this
                                  transaction? This action cannot be undone.
                                  <div className="mt-3 p-3 bg-muted rounded-lg">
                                    <p className="font-medium">
                                      {transaction.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ₹
                                      {transaction.amount.toLocaleString(
                                        "en-IN"
                                      )}{" "}
                                      • {transaction.category} •{" "}
                                      {format(
                                        new Date(transaction.date),
                                        "MMM dd, yyyy"
                                      )}
                                    </p>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(transaction.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && onPageChange && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                total={pagination.total}
                onPageChange={onPageChange}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
