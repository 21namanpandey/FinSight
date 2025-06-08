// export const dynamic = "force-dynamic";
// import { NextRequest } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
// import { REVERSE_CATEGORY_MAPPING } from '@/lib/validations';
// import { handleApiError, createSuccessResponse } from '@/lib/api-utils';
// import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');

//     // Try to get cached data
//     const cacheKey = `${CACHE_KEYS.DASHBOARD_STATS}:${month}`;
//     const cached = await redis.get(cacheKey);
    
//     if (cached) {
//       return createSuccessResponse(JSON.parse(cached));
//     }

//     const currentDate = new Date(`${month}-01`);
//     const monthStart = startOfMonth(currentDate);
//     const monthEnd = endOfMonth(currentDate);

//     // Get current month transactions
//     const currentMonthTransactions = await prisma.transaction.findMany({
//       where: {
//         date: {
//           gte: monthStart,
//           lte: monthEnd,
//         },
//       },
//       orderBy: { date: 'desc' },
//     });

//     // Calculate monthly expenses
//     const totalMonthlyExpenses = currentMonthTransactions.reduce(
//       (sum, transaction) => sum + Math.abs(transaction.amount),
//       0
//     );

//     // Get recent transactions (last 5)
//     const recentTransactions = currentMonthTransactions
//       .slice(0, 5)
//       .map(transaction => ({
//         ...transaction,
//         category: REVERSE_CATEGORY_MAPPING[transaction.category] || 'Other',
//       }));

//     // Category-wise breakdown
//     const categoryBreakdown = currentMonthTransactions.reduce((acc, transaction) => {
//       const category = REVERSE_CATEGORY_MAPPING[transaction.category] || 'Other';
//       acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
//       return acc;
//     }, {} as Record<string, number>);

//     const topSpendingCategory = Object.entries(categoryBreakdown)
//       .sort(([, a], [, b]) => b - a)[0];

//     // Get spending trends (last 6 months)
//     const spendingTrends = [];
//     for (let i = 5; i >= 0; i--) {
//       const trendMonth = subMonths(currentDate, i);
//       const trendMonthStart = startOfMonth(trendMonth);
//       const trendMonthEnd = endOfMonth(trendMonth);

//       const monthTransactions = await prisma.transaction.findMany({
//         where: {
//           date: {
//             gte: trendMonthStart,
//             lte: trendMonthEnd,
//           },
//         },
//       });

//       const monthTotal = monthTransactions.reduce(
//         (sum, transaction) => sum + Math.abs(transaction.amount),
//         0
//       );

//       spendingTrends.push({
//         month: format(trendMonth, 'MMM yyyy'),
//         amount: monthTotal,
//       });
//     }

//     // Get budget alerts
//     const budgets = await prisma.budget.findMany({
//       where: { month },
//     });

//     const budgetAlerts = [];
//     for (const budget of budgets) {
//       const categoryTransactions = currentMonthTransactions.filter(
//         transaction => transaction.category === budget.category
//       );
      
//       const spent = categoryTransactions.reduce(
//         (sum, transaction) => sum + Math.abs(transaction.amount),
//         0
//       );

//       const percentage = (spent / budget.amount) * 100;
//       const category = REVERSE_CATEGORY_MAPPING[budget.category] || 'Other';

//       if (percentage >= 100) {
//         budgetAlerts.push({
//           category,
//           type: 'exceeded',
//           message: `Budget exceeded for ${category}`,
//           spent,
//           budget: budget.amount,
//           percentage,
//         });
//       } else if (percentage >= 80) {
//         budgetAlerts.push({
//           category,
//           type: 'warning',
//           message: `Approaching budget limit for ${category}`,
//           spent,
//           budget: budget.amount,
//           percentage,
//         });
//       }
//     }

//     const dashboardData = {
//       monthlyExpenses: {
//         total: totalMonthlyExpenses,
//         month: format(currentDate, 'MMMM yyyy'),
//       },
//       recentTransactions,
//       topSpendingCategory: topSpendingCategory ? {
//         category: topSpendingCategory[0],
//         amount: topSpendingCategory[1],
//       } : null,
//       categoryBreakdown,
//       spendingTrends,
//       budgetAlerts,
//       transactionCount: currentMonthTransactions.length,
//     };

//     // Cache the result
//     await redis.setex(cacheKey, CACHE_TTL.DASHBOARD, JSON.stringify(dashboardData));

//     return createSuccessResponse(dashboardData);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }







export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { REVERSE_CATEGORY_MAPPING } from '@/lib/validations';
import { handleApiError, createSuccessResponse } from '@/lib/api-utils';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');
    const forceRefresh = searchParams.has('_t'); // Check for cache-busting parameter

    // Try to get cached data only if not forcing refresh
    let cached = null;
    const cacheKey = `${CACHE_KEYS.DASHBOARD_STATS}:${month}`;
    
    if (!forceRefresh) {
      cached = await redis.get(cacheKey);
    }
    
    if (cached && !forceRefresh) {
      return createSuccessResponse(JSON.parse(cached));
    }

    const currentDate = new Date(`${month}-01`);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Get current month transactions
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate monthly expenses
    const totalMonthlyExpenses = currentMonthTransactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amount),
      0
    );

    // Get recent transactions (last 5)
    const recentTransactions = currentMonthTransactions
      .slice(0, 5)
      .map(transaction => ({
        ...transaction,
        category: REVERSE_CATEGORY_MAPPING[transaction.category] || 'Other',
      }));

    // Category-wise breakdown
    const categoryBreakdown = currentMonthTransactions.reduce((acc, transaction) => {
      const category = REVERSE_CATEGORY_MAPPING[transaction.category] || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    const topSpendingCategory = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)[0];

    // Get spending trends (last 6 months)
    const spendingTrends = [];
    for (let i = 5; i >= 0; i--) {
      const trendMonth = subMonths(currentDate, i);
      const trendMonthStart = startOfMonth(trendMonth);
      const trendMonthEnd = endOfMonth(trendMonth);

      const monthTransactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: trendMonthStart,
            lte: trendMonthEnd,
          },
        },
      });

      const monthTotal = monthTransactions.reduce(
        (sum, transaction) => sum + Math.abs(transaction.amount),
        0
      );

      spendingTrends.push({
        month: format(trendMonth, 'MMM yyyy'),
        amount: monthTotal,
      });
    }

    // Get budget alerts
    const budgets = await prisma.budget.findMany({
      where: { month },
    });

    const budgetAlerts = [];
    for (const budget of budgets) {
      const categoryTransactions = currentMonthTransactions.filter(
        transaction => transaction.category === budget.category
      );
      
      const spent = categoryTransactions.reduce(
        (sum, transaction) => sum + Math.abs(transaction.amount),
        0
      );

      const percentage = (spent / budget.amount) * 100;
      const category = REVERSE_CATEGORY_MAPPING[budget.category] || 'Other';

      if (percentage >= 100) {
        budgetAlerts.push({
          category,
          type: 'exceeded',
          message: `Budget exceeded for ${category}`,
          spent,
          budget: budget.amount,
          percentage,
        });
      } else if (percentage >= 80) {
        budgetAlerts.push({
          category,
          type: 'warning',
          message: `Approaching budget limit for ${category}`,
          spent,
          budget: budget.amount,
          percentage,
        });
      }
    }

    const dashboardData = {
      monthlyExpenses: {
        total: totalMonthlyExpenses,
        month: format(currentDate, 'MMMM yyyy'),
      },
      recentTransactions,
      topSpendingCategory: topSpendingCategory ? {
        category: topSpendingCategory[0],
        amount: topSpendingCategory[1],
      } : null,
      categoryBreakdown,
      spendingTrends,
      budgetAlerts,
      transactionCount: currentMonthTransactions.length,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result with shorter TTL for current month
    const isCurrentMonth = month === format(new Date(), 'yyyy-MM');
    const cacheTTL = isCurrentMonth ? 60 : CACHE_TTL.DASHBOARD; // 1 minute for current month, longer for past months
    
    await redis.setex(cacheKey, cacheTTL, JSON.stringify(dashboardData));

    // Set response headers to prevent caching
    const response = createSuccessResponse(dashboardData);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}