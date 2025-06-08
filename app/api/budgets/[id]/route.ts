import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_KEYS } from '@/lib/redis';
import { UpdateBudgetSchema, CATEGORY_MAPPING } from '@/lib/validations';
import { handleApiError, getRequestBody, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!budget) {
      return createErrorResponse('Budget not found', 404);
    }

    // Transform category for frontend
    const transformedBudget = {
      ...budget,
      category: Object.entries(CATEGORY_MAPPING).find(
        ([, value]) => value === budget.category
      )?.[0] || 'Other',
    };

    return createSuccessResponse(transformedBudget);
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

    const validatedData = UpdateBudgetSchema.parse({
      ...body,
      id: params.id,
    });

    const existingBudget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!existingBudget) {
      return createErrorResponse('Budget not found', 404);
    }

    const updateData: any = { ...validatedData };
    delete updateData.id;

    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: updateData,
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

    return createSuccessResponse(transformedBudget);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const existingBudget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!existingBudget) {
      return createErrorResponse('Budget not found', 404);
    }

    await prisma.budget.delete({
      where: { id: params.id },
    });

    // Invalidate relevant caches
    await Promise.all([
      redis.del(CACHE_KEYS.DASHBOARD_STATS),
      redis.del(CACHE_KEYS.BUDGET_ALERTS),
    ]);

    return createSuccessResponse({ message: 'Budget deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}