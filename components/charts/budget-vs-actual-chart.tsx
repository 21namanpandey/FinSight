"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Budget, Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";

interface BudgetVsActualChartProps {
  budgets: Budget[];
  transactions: Transaction[];
}

export function BudgetVsActualChart({
  budgets,
  transactions,
}: BudgetVsActualChartProps) {
  // Ensure budgets and transactions are arrays
  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const chartData = safeBudgets.map((budget) => {
    const spent = safeTransactions
      .filter((transaction) => {
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
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    return {
      category: budget.category,
      budget: budget.amount,
      actual: spent,
      month: budget.month,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600 font-semibold">
              Budget: ₹{payload[0].value.toLocaleString("en-IN")}
            </p>
            <p className="text-emerald-600 font-semibold">
              Actual: ₹{payload[1].value.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          Budget vs Actual Spending
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No budget data to display</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="category"
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="budget"
                  fill="#3b82f6"
                  name="Budget"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="actual"
                  fill="#10b981"
                  name="Actual"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
