// "use client";

// import React from "react";
// import { format } from "date-fns";
// import { DashboardStats } from "@/components/dashboard-stats";
// import { CategoryPieChart } from "@/components/charts/category-pie-chart";
// import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
// import { TransactionList } from "@/components/transaction-list";
// import { BudgetAlerts } from "@/components/budget-alerts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar, Loader2 } from "lucide-react";

// interface DashboardData {
//   monthlyExpenses: {
//     total: number;
//     month: string;
//   };
//   recentTransactions: any[];
//   topSpendingCategory: {
//     category: string;
//     amount: number;
//   } | null;
//   categoryBreakdown: Record<string, number>;
//   spendingTrends: {
//     month: string;
//     amount: number;
//   }[];
//   budgetAlerts: {
//     category: string;
//     type: 'exceeded' | 'warning';
//     message: string;
//     spent: number;
//     budget: number;
//     percentage: number;
//   }[];
//   transactionCount: number;
// }

// export default function Dashboard() {
//   const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
//   const [isLoading, setIsLoading] = React.useState(true);
//   const [error, setError] = React.useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = React.useState(format(new Date(), 'yyyy-MM'));

//   const fetchDashboardData = async (month: string) => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       const response = await fetch(`/api/dashboard?month=${month}`);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.success) {
//         setDashboardData(result.data);
//       } else {
//         throw new Error(result.error || 'Failed to fetch dashboard data');
//       }
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError(error instanceof Error ? error.message : 'An unexpected error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Load dashboard data on mount and when month changes
//   React.useEffect(() => {
//     fetchDashboardData(selectedMonth);
//   }, [selectedMonth]);

//   const handleMonthChange = (month: string) => {
//     setSelectedMonth(month);
//   };

//   // Generate month options for the last 12 months
//   const getMonthOptions = () => {
//     const options = [];
//     const currentDate = new Date();

//     for (let i = 0; i < 12; i++) {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
//       const value = format(date, 'yyyy-MM');
//       const label = format(date, 'MMMM yyyy');
//       options.push({ value, label });
//     }

//     return options;
//   };

//   if (error) {
//     return (
//       <main className="container mx-auto px-4 py-8">
//         <div className="space-y-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
//             <p className="text-muted-foreground">Overview of your financial activity</p>
//           </div>

//           <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
//             <CardContent className="pt-6">
//               <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
//                 <span className="font-medium">Error loading dashboard:</span>
//                 <span>{error}</span>
//               </div>
//               <button
//                 onClick={() => fetchDashboardData(selectedMonth)}
//                 className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 rounded-md transition-colors"
//               >
//                 Try Again
//               </button>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <div className="space-y-8">
//         {/* Page Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
//             <p className="text-muted-foreground">Overview of your financial activity</p>
//           </div>

//           {/* Month Selector */}
//           <div className="flex items-center gap-2">
//             <Calendar className="h-4 w-4 text-muted-foreground" />
//             <Select value={selectedMonth} onValueChange={handleMonthChange}>
//               <SelectTrigger className="w-48">
//                 <SelectValue placeholder="Select month" />
//               </SelectTrigger>
//               <SelectContent>
//                 {getMonthOptions().map(option => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="flex items-center gap-2 text-muted-foreground">
//               <Loader2 className="h-6 w-6 animate-spin" />
//               <span>Loading dashboard data...</span>
//             </div>
//           </div>
//         ) : dashboardData ? (
//           <>
//             {/* Budget Alerts */}
//             {dashboardData.budgetAlerts.length > 0 && (
//               <BudgetAlerts alerts={dashboardData.budgetAlerts} />
//             )}

//             {/* Stats Cards */}
//             <DashboardStats
//               monthlyExpenses={dashboardData.monthlyExpenses}
//               transactionCount={dashboardData.transactionCount}
//               topSpendingCategory={dashboardData.topSpendingCategory}
//             />

//             {/* Charts Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <CategoryPieChart categoryBreakdown={dashboardData.categoryBreakdown} />
//               <MonthlyTrendChart spendingTrends={dashboardData.spendingTrends} />
//             </div>

//             {/* Recent Transactions */}
//             <div>
//               <h2 className="text-2xl font-semibold text-foreground mb-4">Recent Transactions</h2>
//               <TransactionList
//                 transactions={dashboardData.recentTransactions}
//                 onEdit={() => {}}
//                 onDelete={() => {}}
//                 isLoading={false}
//                 showSummary={false}
//               />
//             </div>
//           </>
//         ) : (
//           <div className="flex items-center justify-center py-12">
//             <div className="text-center text-muted-foreground">
//               <p>No data available for the selected month.</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

"use client";

import React from "react";
import { format } from "date-fns";
import { DashboardStats } from "@/components/dashboard-stats";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { TransactionList } from "@/components/transaction-list";
import { BudgetAlerts } from "@/components/budget-alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, RefreshCw, Clock } from "lucide-react";

interface DashboardData {
  monthlyExpenses: {
    total: number;
    month: string;
  };
  recentTransactions: any[];
  topSpendingCategory: {
    category: string;
    amount: number;
  } | null;
  categoryBreakdown: Record<string, number>;
  spendingTrends: {
    month: string;
    amount: number;
  }[];
  budgetAlerts: {
    category: string;
    type: "exceeded" | "warning";
    message: string;
    spent: number;
    budget: number;
    percentage: number;
  }[];
  transactionCount: number;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] =
    React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState(
    format(new Date(), "yyyy-MM")
  );
  const [lastFetched, setLastFetched] = React.useState<Date | null>(null);

  const fetchDashboardData = async (month: string, forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Add cache-busting parameter for real-time data
      const cacheBuster = forceRefresh ? `&_t=${Date.now()}` : "";
      const response = await fetch(
        `/api/dashboard?month=${month}${cacheBuster}`,
        {
          cache: "no-cache", // Disable browser caching
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
        setLastFetched(new Date());
      } else {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load dashboard data on mount and when month changes
  React.useEffect(() => {
    fetchDashboardData(selectedMonth);
  }, [selectedMonth]);

  // Auto-refresh every 30 seconds for current month
  React.useEffect(() => {
    const currentMonth = format(new Date(), "yyyy-MM");
    if (selectedMonth === currentMonth) {
      const interval = setInterval(() => {
        fetchDashboardData(selectedMonth, true);
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedMonth]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleRefresh = () => {
    fetchDashboardData(selectedMonth, true);
  };

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }

    return options;
  };

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of your financial activity
            </p>
          </div>

          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span className="font-medium">Error loading dashboard:</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchDashboardData(selectedMonth, true)}
                className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 rounded-md transition-colors"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <p>Overview of your financial activity</p>
              {lastFetched && (
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>Updated {format(lastFetched, "HH:mm:ss")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading dashboard data...</span>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Budget Alerts */}
            {dashboardData.budgetAlerts.length > 0 && (
              <BudgetAlerts alerts={dashboardData.budgetAlerts} />
            )}

            {/* Stats Cards */}
            <DashboardStats
              monthlyExpenses={dashboardData.monthlyExpenses}
              transactionCount={dashboardData.transactionCount}
              topSpendingCategory={dashboardData.topSpendingCategory}
            />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart
                categoryBreakdown={dashboardData.categoryBreakdown}
              />
              <MonthlyTrendChart
                spendingTrends={dashboardData.spendingTrends}
              />
            </div>

            {/* Recent Transactions */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Recent Transactions
              </h2>
              <TransactionList
                transactions={dashboardData.recentTransactions}
                onEdit={() => {}}
                onDelete={() => {}}
                isLoading={false}
                showSummary={false}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <p>No data available for the selected month.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
