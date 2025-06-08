export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { TransactionSchema, CATEGORY_MAPPING } from '@/lib/validations';
import { handleApiError, getRequestBody, createSuccessResponse } from '@/lib/api-utils';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const month = searchParams.get('month');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (category && category in CATEGORY_MAPPING) {
      where.category = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING];
    }
    
    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Transform categories for frontend
    const transformedTransactions = transactions.map(transaction => ({
      ...transaction,
      category: Object.entries(CATEGORY_MAPPING).find(
        ([, value]) => value === transaction.category
      )?.[0] || 'Other',
    }));

    return createSuccessResponse({
      transactions: transformedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request);
    
    // Transform category from frontend format
    const categoryKey = body.category as keyof typeof CATEGORY_MAPPING;
    if (categoryKey in CATEGORY_MAPPING) {
      body.category = CATEGORY_MAPPING[categoryKey];
    }

    const validatedData = TransactionSchema.parse(body);

    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      },
    });

    // Invalidate relevant caches
    const month = format(transaction.date, 'yyyy-MM');
    await Promise.all([
      redis.del(CACHE_KEYS.DASHBOARD_STATS),
      redis.del(CACHE_KEYS.MONTHLY_EXPENSES(month)),
      redis.del(CACHE_KEYS.CATEGORY_BREAKDOWN(month)),
      redis.del(CACHE_KEYS.BUDGET_ALERTS),
    ]);

    // Transform category back for frontend
    const transformedTransaction = {
      ...transaction,
      category: Object.entries(CATEGORY_MAPPING).find(
        ([, value]) => value === transaction.category
      )?.[0] || 'Other',
    };

    return createSuccessResponse(transformedTransaction, 201);
  } catch (error) {
    return handleApiError(error);
  }
}