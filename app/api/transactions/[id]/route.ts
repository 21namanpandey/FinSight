// export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_KEYS } from '@/lib/redis';
import { UpdateTransactionSchema, CATEGORY_MAPPING } from '@/lib/validations';
import { handleApiError, getRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { format } from 'date-fns';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return createErrorResponse('Transaction not found', 404);
    }

    // Transform category for frontend
    const transformedTransaction = {
      ...transaction,
      category: Object.entries(CATEGORY_MAPPING).find(
        ([, value]) => value === transaction.category
      )?.[0] || 'Other',
    };

    return createSuccessResponse(transformedTransaction);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await getRequestBody(request);
    
    // Transform category from frontend format
    if (body.category && body.category in CATEGORY_MAPPING) {
      body.category = CATEGORY_MAPPING[body.category as keyof typeof CATEGORY_MAPPING];
    }

    const validatedData = UpdateTransactionSchema.parse({
      ...body,
      id: params.id,
    });

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!existingTransaction) {
      return createErrorResponse('Transaction not found', 404);
    }

    const updateData: any = { ...validatedData };
    delete updateData.id;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
    });

    // Invalidate relevant caches
    const oldMonth = format(existingTransaction.date, 'yyyy-MM');
    const newMonth = format(transaction.date, 'yyyy-MM');
    
    await Promise.all([
      redis.del(CACHE_KEYS.DASHBOARD_STATS),
      redis.del(CACHE_KEYS.MONTHLY_EXPENSES(oldMonth)),
      redis.del(CACHE_KEYS.CATEGORY_BREAKDOWN(oldMonth)),
      redis.del(CACHE_KEYS.BUDGET_ALERTS),
      ...(oldMonth !== newMonth ? [
        redis.del(CACHE_KEYS.MONTHLY_EXPENSES(newMonth)),
        redis.del(CACHE_KEYS.CATEGORY_BREAKDOWN(newMonth)),
      ] : []),
    ]);

    // Transform category back for frontend
    const transformedTransaction = {
      ...transaction,
      category: Object.entries(CATEGORY_MAPPING).find(
        ([, value]) => value === transaction.category
      )?.[0] || 'Other',
    };

    return createSuccessResponse(transformedTransaction);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!existingTransaction) {
      return createErrorResponse('Transaction not found', 404);
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    });

    // Invalidate relevant caches
    const month = format(existingTransaction.date, 'yyyy-MM');
    await Promise.all([
      redis.del(CACHE_KEYS.DASHBOARD_STATS),
      redis.del(CACHE_KEYS.MONTHLY_EXPENSES(month)),
      redis.del(CACHE_KEYS.CATEGORY_BREAKDOWN(month)),
      redis.del(CACHE_KEYS.BUDGET_ALERTS),
    ]);

    return createSuccessResponse({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}