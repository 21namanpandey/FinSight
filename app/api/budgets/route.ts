export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { BudgetSchema, CATEGORY_MAPPING } from '@/lib/validations';
import { handleApiError, getRequestBody, createSuccessResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const category = searchParams.get('category');

    const where: any = {};
    
    if (month) {
      where.month = month;
    }
    
    if (category && category in CATEGORY_MAPPING) {
      where.category = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING];
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Transform categories for frontend
    const transformedBudgets = budgets.map(budget => ({
      ...budget,
      category: Object.entries(CATEGORY_MAPPING).find(
        ([, value]) => value === budget.category
      )?.[0] || 'Other',
    }));

    return createSuccessResponse(transformedBudgets);
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

    const validatedData = BudgetSchema.parse(body);

    const budget = await prisma.budget.upsert({
      where: {
        category_month: {
          category: validatedData.category,
          month: validatedData.month,
        },
      },
      update: {
        amount: validatedData.amount,
      },
      create: validatedData,
    });

    // Invalidate relevant caches
    await Promise.all([
      redis.del(CACHE_KEYS.DASHBOARD_STATS),
      redis.del(CACHE_KEYS.BUDGET_ALERTS),
    ]);

    // Transform category back for frontend
    const transformedBudget = {
      ...budget,
      category: Object.entries(CATEGORY_MAPPING).find(
        ([, value]) => value === budget.category
      )?.[0] || 'Other',
    };

    return createSuccessResponse(transformedBudget, 201);
  } catch (error) {
    return handleApiError(error);
  }
}