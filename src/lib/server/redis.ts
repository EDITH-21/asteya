import { Redis } from "@upstash/redis";
import type { AdminUser, AdminSession, Enquiry } from "./db";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export function isRedisConfigured(): boolean {
  return redis !== null;
}

/**
 * Atomic sliding window rate limiter backed by Upstash Redis.
 */
export async function redisRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) {
    return { allowed: true, remaining: limit };
  }

  try {
    const fullKey = `ratelimit:${key}`;
    const count = await redis.incr(fullKey);

    if (count === 1) {
      await redis.expire(fullKey, windowSeconds);
    }

    if (count > limit) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: Math.max(0, limit - count) };
  } catch (err) {
    console.error("[Redis RateLimit Error]", err);
    // Fail open if redis network error occurs so legitimate users aren't locked out
    return { allowed: true, remaining: 1 };
  }
}

/**
 * Distributed lockout manager for admin brute-force protection.
 */
export async function redisCheckLockout(
  ip: string,
  email: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  if (!redis) return { allowed: true };

  try {
    const key = `lockout:${ip}:${email.toLowerCase().trim()}`;
    const lockedUntil = await redis.get<number>(`${key}:locked`);
    if (lockedUntil && lockedUntil > Date.now()) {
      const remainingSeconds = Math.ceil((lockedUntil - Date.now()) / 1000);
      return { allowed: false, retryAfterSeconds: remainingSeconds };
    }
    return { allowed: true };
  } catch (err) {
    console.error("[Redis CheckLockout Error]", err);
    return { allowed: true };
  }
}

export async function redisRecordFailedLogin(
  ip: string,
  email: string
): Promise<void> {
  if (!redis) return;

  try {
    const key = `lockout:${ip}:${email.toLowerCase().trim()}`;
    const attempts = await redis.incr(`${key}:attempts`);
    if (attempts === 1) {
      await redis.expire(`${key}:attempts`, 15 * 60); // 15 min window
    }

    if (attempts >= 5) {
      const lockDurationSeconds = 15 * 60; // Lock for 15 minutes
      const lockedUntil = Date.now() + lockDurationSeconds * 1000;
      await redis.set(`${key}:locked`, lockedUntil, { ex: lockDurationSeconds });
      await redis.del(`${key}:attempts`);
    }
  } catch (err) {
    console.error("[Redis RecordFailedLogin Error]", err);
  }
}

export async function redisResetLoginAttempts(
  ip: string,
  email: string
): Promise<void> {
  if (!redis) return;

  try {
    const key = `lockout:${ip}:${email.toLowerCase().trim()}`;
    await redis.del(`${key}:attempts`, `${key}:locked`);
  } catch (err) {
    console.error("[Redis ResetLoginAttempts Error]", err);
  }
}

/**
 * User, Session, and Enquiry persistence via Redis
 */
export async function redisSaveAdminUser(user: AdminUser): Promise<void> {
  if (!redis) return;
  await redis.set(`admin:user:${user.email.toLowerCase().trim()}`, user);
  await redis.set(`admin:user_id:${user.id}`, user.email.toLowerCase().trim());
}

export async function redisGetAdminUser(email: string): Promise<AdminUser | null> {
  if (!redis) return null;
  return await redis.get<AdminUser>(`admin:user:${email.toLowerCase().trim()}`);
}

export async function redisGetAdminUserById(id: string): Promise<AdminUser | null> {
  if (!redis) return null;
  const email = await redis.get<string>(`admin:user_id:${id}`);
  if (!email) return null;
  return await redisGetAdminUser(email);
}

export async function redisCreateSession(session: AdminSession, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  await redis.set(`session:${session.sessionTokenHash}`, session, { ex: ttlSeconds });
}

export async function redisGetSession(tokenHash: string): Promise<AdminSession | null> {
  if (!redis) return null;
  return await redis.get<AdminSession>(`session:${tokenHash}`);
}

export async function redisDeleteSession(tokenHash: string): Promise<void> {
  if (!redis) return;
  await redis.del(`session:${tokenHash}`);
}

export async function redisSaveEnquiry(enquiry: Enquiry): Promise<void> {
  if (!redis) return;
  await redis.set(`enquiry:${enquiry.id}`, enquiry);
  await redis.lpush("enquiry:ids", enquiry.id);
}

export async function redisGetEnquiries(): Promise<Enquiry[]> {
  if (!redis) return [];
  const ids = await redis.lrange<string>("enquiry:ids", 0, -1);
  if (!ids || ids.length === 0) return [];

  const results: Enquiry[] = [];
  for (const id of ids) {
    const record = await redis.get<Enquiry>(`enquiry:${id}`);
    if (record) {
      results.push(record);
    }
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function redisGetEnquiryById(id: string): Promise<Enquiry | null> {
  if (!redis) return null;
  return await redis.get<Enquiry>(`enquiry:${id}`);
}

export async function redisUpdateEnquiry(
  id: string,
  updates: Partial<Enquiry>
): Promise<Enquiry | null> {
  if (!redis) return null;
  const existing = await redisGetEnquiryById(id);
  if (!existing) return null;

  const updated: Enquiry = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`enquiry:${id}`, updated);
  return updated;
}

export async function redisDeleteEnquiry(id: string): Promise<boolean> {
  if (!redis) return false;
  await redis.del(`enquiry:${id}`);
  await redis.lrem("enquiry:ids", 0, id);
  return true;
}
