import "server-only";

import Redis from "ioredis";
import { getEnv } from "@/env";

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

function createRedis() {
  const env = getEnv();
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const env = getEnv();
  const ttl = ttlSeconds ?? env.CACHE_TTL_SECONDS;
  await redis.set(key, JSON.stringify(value), "EX", ttl);
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await redis.del(...keys);
}

export function cacheKey(namespace: string, ...parts: (string | number)[]): string {
  return `${namespace}:${parts.join(":")}`;
}
