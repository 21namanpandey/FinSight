"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetAlert {
  category: string;
  type: 'exceeded' | 'warning';
  message: string;
  spent: number;
  budget: number;
  percentage: number;
}

interface BudgetAlertsProps {
  alerts: BudgetAlert[];
}

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  if (alerts.length === 0) return null;

  const exceededAlerts = alerts.filter(alert => alert.type === 'exceeded');
  const warningAlerts = alerts.filter(alert => alert.type === 'warning');

  return (
    <div className="space-y-4">
      {exceededAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Budget Exceeded
          </h3>
          {exceededAlerts.map((alert, index) => (
            <Alert key={index} className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-80">
                      Spent: ₹{alert.spent.toLocaleString('en-IN')} of ₹{alert.budget.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-full text-xs font-medium",
                      "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    )}>
                      {alert.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {warningAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Budget Warnings
          </h3>
          {warningAlerts.map((alert, index) => (
            <Alert key={index} className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-80">
                      Spent: ₹{alert.spent.toLocaleString('en-IN')} of ₹{alert.budget.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-full text-xs font-medium",
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                    )}>
                      {alert.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}