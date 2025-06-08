"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  monthlyExpenses: {
    total: number;
    month: string;
  };
  transactionCount: number;
  topSpendingCategory: {
    category: string;
    amount: number;
  } | null;
}

export function DashboardStats({
  monthlyExpenses,
  transactionCount,
  topSpendingCategory,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Monthly Expenses",
      value: `₹${Math.abs(monthlyExpenses.total).toLocaleString("en-IN")}`,
      description: monthlyExpenses.month,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Total Transactions",
      value: transactionCount.toString(),
      description: `This month`,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Top Category",
      value: topSpendingCategory ? topSpendingCategory.category : "None",
      description: topSpendingCategory
        ? `₹${Math.abs(topSpendingCategory.amount).toLocaleString("en-IN")}`
        : "No expenses",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="transition-all duration-200 hover:shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
