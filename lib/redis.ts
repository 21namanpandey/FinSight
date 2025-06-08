import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Cache keys
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard:stats',
  MONTHLY_EXPENSES: (month: string) => `expenses:monthly:${month}`,
  CATEGORY_BREAKDOWN: (month: string) => `breakdown:category:${month}`,
  BUDGET_ALERTS: 'budget:alerts',
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  DASHBOARD: 300, // 5 minutes
  MONTHLY: 600,   // 10 minutes
  ALERTS: 180,    // 3 minutes
} as const;