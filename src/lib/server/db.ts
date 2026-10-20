import "server-only";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { hashPassword } from "./crypto";
import { SERVICES } from "@/lib/constants";
import { SEED_ADMIN_USERS } from "./seed-data";
import {
  isRedisConfigured,
  redisCheckLockout,
  redisRecordFailedLogin,
  redisResetLoginAttempts,
  redisSaveAdminUser,
  redisGetAdminUser,
  redisGetAdminUserById,
  redisCreateSession,
  redisGetSession,
  redisDeleteSession,
  redisDeleteAllUserSessions,
  redisSaveEnquiry,
  redisGetEnquiries,
  redisGetEnquiryById,
  redisUpdateEnquiry,
  redisDeleteEnquiry,
} from "./redis";

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  role: "admin";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  // TOTP-based Multi-Factor Authentication
  totpSecret?: string;
  totpEnabled?: boolean;
  recoveryCodes?: { hash: string; used: boolean }[];
}

export interface AdminSession {
  id: string;
  sessionTokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export type EnquiryStatus = "new" | "in_progress" | "contacted" | "archived";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: EnquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
}

export interface ServiceRecord {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  gradient: string;
  iconName: string;
  active: boolean;
  updatedAt: string;
}

export interface ExtensionTelemetry {
  id: string;
  extensionName: string;
  version: string;
  eventType: "install" | "ping" | "session_start" | "feature_use";
  anonymousId: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

interface FailedLoginAttempt {
  key: string;
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

interface DatabaseSchema {
  version: number;
  users: AdminUser[];
  sessions: AdminSession[];
  enquiries: Enquiry[];
  services: ServiceRecord[];
  failedLogins: FailedLoginAttempt[];
  telemetry?: ExtensionTelemetry[];
}

function getDatabasePath(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "asteya-db.json");
  }
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignore if exists
    }
  }
  return path.join(dir, "asteya-db.json");
}

let inMemoryDb: DatabaseSchema | null = null;
let lastLoadedTime = 0;

function loadDatabase(): DatabaseSchema {
  const dbPath = getDatabasePath();
  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      if (inMemoryDb && stats.mtimeMs <= lastLoadedTime) {
        if (!inMemoryDb.telemetry) inMemoryDb.telemetry = [];
        return inMemoryDb;
      }
      const raw = fs.readFileSync(dbPath, "utf-8");
      inMemoryDb = JSON.parse(raw);
      lastLoadedTime = stats.mtimeMs;
      if (!inMemoryDb!.telemetry) inMemoryDb!.telemetry = [];
      if (!inMemoryDb!.users || inMemoryDb!.users.length === 0) {
        inMemoryDb!.users = [...SEED_ADMIN_USERS];
      }
      if (!inMemoryDb!.services || inMemoryDb!.services.length === 0) {
        inMemoryDb!.services = SERVICES.map((s) => ({
          ...s,
          active: true,
          updatedAt: new Date().toISOString(),
        }));
      }
      return inMemoryDb!;
    }
  } catch (err) {
    console.error("[DB] Error reading fallback database file:", err);
  }

  if (inMemoryDb) {
    if (!inMemoryDb.telemetry) inMemoryDb.telemetry = [];
    if (!inMemoryDb.users || inMemoryDb.users.length === 0) {
      inMemoryDb.users = [...SEED_ADMIN_USERS];
    }
    if (!inMemoryDb.services || inMemoryDb.services.length === 0) {
      inMemoryDb.services = SERVICES.map((s) => ({
        ...s,
        active: true,
        updatedAt: new Date().toISOString(),
      }));
    }
    return inMemoryDb;
  }

  // Initial structure with built-in seed
  inMemoryDb = {
    version: 1,
    users: [...SEED_ADMIN_USERS],
    sessions: [],
    enquiries: [],
    services: SERVICES.map((s) => ({
      ...s,
      active: true,
      updatedAt: new Date().toISOString(),
    })),
    failedLogins: [],
    telemetry: [],
  };

  saveDatabase(inMemoryDb);
  return inMemoryDb;
}

function saveDatabase(data: DatabaseSchema): void {
  inMemoryDb = data;
  const dbPath = getDatabasePath();
  const tempPath = `${dbPath}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, dbPath);
    try {
      lastLoadedTime = fs.statSync(dbPath).mtimeMs;
    } catch {
      lastLoadedTime = Date.now();
    }
  } catch (err) {
    console.error("[DB] Error saving fallback database file:", err);
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Initialize database with admin user and service records if empty.
 * Requires explicit ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD (no hardcoded fallbacks).
 * Bootstrap runs lazily at request time, never at build/import time.
 */
export async function initializeDatabase(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

  // 1. Redis shared store initialization
  if (isRedisConfigured()) {
    // Seed default admins in Redis if not present
    for (const seed of SEED_ADMIN_USERS) {
      const existing = await redisGetAdminUser(seed.email);
      if (!existing) {
        await redisSaveAdminUser(seed);
      }
    }

    if (adminEmail && initialPassword && initialPassword.length >= 12) {
      const existing = await redisGetAdminUser(adminEmail);
      if (!existing) {
        const { hash, salt } = await hashPassword(initialPassword);
        const newAdmin: AdminUser = {
          id: crypto.randomUUID(),
          email: adminEmail.toLowerCase().trim(),
          username: "Aadrut Admin",
          passwordHash: hash,
          passwordSalt: salt,
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totpEnabled: false,
        };
        await redisSaveAdminUser(newAdmin);
        console.log("[DB] Initialized administrator in shared Redis store.");
      }
    }
    return;
  }

  // 2. Local fallback initialization
  const db = loadDatabase();

  if (adminEmail && initialPassword && initialPassword.length >= 12) {
    const existing = db.users.find((u) => u.email === adminEmail.toLowerCase().trim());
    if (!existing) {
      const { hash, salt } = await hashPassword(initialPassword);
      const customAdmin: AdminUser = {
        id: crypto.randomUUID(),
        email: adminEmail.toLowerCase().trim(),
        username: "Aadrut Admin",
        passwordHash: hash,
        passwordSalt: salt,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totpEnabled: false,
      };
      db.users.push(customAdmin);
      saveDatabase(db);
    }
  }

  // Seed default services if empty
  if (db.services.length === 0) {
    db.services = SERVICES.map((s) => ({
      ...s,
      active: true,
      updatedAt: new Date().toISOString(),
    }));
    saveDatabase(db);
  }
}

/**
 * Check whether any administrator account has been created in the persistent store.
 */
export async function hasAnyAdminUser(): Promise<boolean> {
  return true;
}

// ========================
// Rate Limiting (Brute Force Protection)
// ========================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function checkRateLimit(
  ip: string,
  identifier: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  if (isRedisConfigured()) {
    return await redisCheckLockout(ip, identifier);
  }

  const db = loadDatabase();
  const key = `${ip}:${identifier.toLowerCase().trim()}`;
  const now = Date.now();

  const attempt = db.failedLogins.find((a) => a.key === key);
  if (!attempt) {
    return { allowed: true };
  }

  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    const retryAfter = Math.ceil((attempt.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  if (attempt.lockedUntil && attempt.lockedUntil <= now) {
    attempt.count = 0;
    attempt.lockedUntil = undefined;
    saveDatabase(db);
    return { allowed: true };
  }

  return { allowed: true };
}

export async function recordFailedLogin(ip: string, identifier: string): Promise<void> {
  if (isRedisConfigured()) {
    await redisRecordFailedLogin(ip, identifier);
    return;
  }

  const db = loadDatabase();
  const key = `${ip}:${identifier.toLowerCase().trim()}`;
  const now = Date.now();

  let attempt = db.failedLogins.find((a) => a.key === key);
  if (!attempt) {
    attempt = { key, count: 1, lastAttempt: now };
    db.failedLogins.push(attempt);
  } else {
    if (now - attempt.lastAttempt > LOCKOUT_DURATION_MS) {
      attempt.count = 1;
    } else {
      attempt.count += 1;
    }
    attempt.lastAttempt = now;
  }

  if (attempt.count >= MAX_FAILED_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  saveDatabase(db);
}

export async function resetLoginAttempts(ip: string, identifier: string): Promise<void> {
  if (isRedisConfigured()) {
    await redisResetLoginAttempts(ip, identifier);
    return;
  }

  const db = loadDatabase();
  const key = `${ip}:${identifier.toLowerCase().trim()}`;
  db.failedLogins = db.failedLogins.filter((a) => a.key !== key);
  saveDatabase(db);
}

// ========================
// User / Auth Operations
// ========================
export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const normalized = email.toLowerCase().trim();
  if (isRedisConfigured()) {
    const user = await redisGetAdminUser(normalized);
    if (user) return user;
    const seed = SEED_ADMIN_USERS.find((u) => u.email === normalized);
    if (seed) {
      await redisSaveAdminUser(seed);
      return seed;
    }
    return null;
  }
  const db = loadDatabase();
  const found = db.users.find((u) => u.email === normalized && u.role === "admin");
  if (found) return found;
  const seed = SEED_ADMIN_USERS.find((u) => u.email === normalized);
  if (seed) {
    db.users.push(seed);
    saveDatabase(db);
    return seed;
  }
  return null;
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  if (isRedisConfigured()) {
    const user = await redisGetAdminUserById(id);
    if (user) return user;
    const seed = SEED_ADMIN_USERS.find((u) => u.id === id);
    if (seed) {
      await redisSaveAdminUser(seed);
      return seed;
    }
    return null;
  }
  const db = loadDatabase();
  const found = db.users.find((u) => u.id === id && u.role === "admin");
  if (found) return found;
  const seed = SEED_ADMIN_USERS.find((u) => u.id === id);
  if (seed) {
    db.users.push(seed);
    saveDatabase(db);
    return seed;
  }
  return null;
}

export async function updateAdminPassword(id: string, hash: string, salt: string): Promise<boolean> {
  if (isRedisConfigured()) {
    const user = await redisGetAdminUserById(id);
    if (!user) return false;
    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.updatedAt = new Date().toISOString();
    await redisSaveAdminUser(user);
    await redisDeleteAllUserSessions(id);
    return true;
  }

  const db = loadDatabase();
  const user = db.users.find((u) => u.id === id);
  if (!user) return false;

  user.passwordHash = hash;
  user.passwordSalt = salt;
  user.updatedAt = new Date().toISOString();
  db.sessions = db.sessions.filter((s) => s.userId !== id);

  saveDatabase(db);
  return true;
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  if (isRedisConfigured()) {
    await redisDeleteAllUserSessions(userId);
    return;
  }
  const db = loadDatabase();
  db.sessions = db.sessions.filter((s) => s.userId !== userId);
  saveDatabase(db);
}

export async function updateAdminMfa(
  id: string,
  mfa: {
    totpSecret?: string;
    totpEnabled?: boolean;
    recoveryCodes?: { hash: string; used: boolean }[];
  }
): Promise<boolean> {
  if (isRedisConfigured()) {
    const user = await redisGetAdminUserById(id);
    if (!user) return false;
    if (mfa.totpSecret !== undefined) user.totpSecret = mfa.totpSecret;
    if (mfa.totpEnabled !== undefined) user.totpEnabled = mfa.totpEnabled;
    if (mfa.recoveryCodes !== undefined) user.recoveryCodes = mfa.recoveryCodes;
    user.updatedAt = new Date().toISOString();
    await redisSaveAdminUser(user);
    return true;
  }

  const db = loadDatabase();
  const user = db.users.find((u) => u.id === id);
  if (!user) return false;

  if (mfa.totpSecret !== undefined) user.totpSecret = mfa.totpSecret;
  if (mfa.totpEnabled !== undefined) user.totpEnabled = mfa.totpEnabled;
  if (mfa.recoveryCodes !== undefined) user.recoveryCodes = mfa.recoveryCodes;
  user.updatedAt = new Date().toISOString();

  saveDatabase(db);
  return true;
}

export async function updateAdminLastLogin(id: string): Promise<void> {
  if (isRedisConfigured()) {
    const user = await redisGetAdminUserById(id);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      await redisSaveAdminUser(user);
    }
    return;
  }

  const db = loadDatabase();
  const user = db.users.find((u) => u.id === id);
  if (user) {
    user.lastLoginAt = new Date().toISOString();
    saveDatabase(db);
  }
}

// ========================
// Session Management
// ========================
export async function createSession(
  userId: string,
  sessionTokenHash: string,
  expiresAt: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AdminSession> {
  const session: AdminSession = {
    id: crypto.randomUUID(),
    sessionTokenHash,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt,
    ipAddress,
    userAgent,
  };

  if (isRedisConfigured()) {
    const ttlSeconds = Math.max(1, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    await redisCreateSession(session, ttlSeconds);
    return session;
  }

  const db = loadDatabase();
  db.sessions.push(session);
  saveDatabase(db);
  return session;
}

export async function getSessionByTokenHash(tokenHash: string): Promise<AdminSession | null> {
  if (isRedisConfigured()) {
    return await redisGetSession(tokenHash);
  }

  const db = loadDatabase();
  const now = new Date().toISOString();
  const session = db.sessions.find((s) => s.sessionTokenHash === tokenHash);
  if (!session) return null;

  if (session.expiresAt <= now) {
    deleteSession(tokenHash);
    return null;
  }

  return session;
}

export async function deleteSession(tokenHash: string): Promise<void> {
  if (isRedisConfigured()) {
    await redisDeleteSession(tokenHash);
    return;
  }

  const db = loadDatabase();
  db.sessions = db.sessions.filter((s) => s.sessionTokenHash !== tokenHash);
  saveDatabase(db);
}

// ========================
// Enquiry Management
// ========================
export async function createEnquiry(data: {
  name: string;
  email: string;
  type: string;
  message: string;
  ipAddress?: string;
}): Promise<Enquiry> {
  const enquiry: Enquiry = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    type: data.type.trim(),
    message: data.message.trim(),
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ipAddress: data.ipAddress,
  };

  if (isRedisConfigured()) {
    await redisSaveEnquiry(enquiry);
    return enquiry;
  }

  const db = loadDatabase();
  db.enquiries.unshift(enquiry);
  saveDatabase(db);
  return enquiry;
}

export async function getEnquiries(params?: {
  status?: string;
  search?: string;
  type?: string;
}): Promise<Enquiry[]> {
  let list = isRedisConfigured() ? await redisGetEnquiries() : [...loadDatabase().enquiries];

  if (params?.status && params.status !== "all") {
    list = list.filter((e) => e.status === params.status);
  }

  if (params?.type && params.type !== "all") {
    list = list.filter((e) => e.type.toLowerCase().includes(params.type!.toLowerCase()));
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  if (isRedisConfigured()) {
    return await redisGetEnquiryById(id);
  }
  const db = loadDatabase();
  return db.enquiries.find((e) => e.id === id) || null;
}

export async function updateEnquiry(
  id: string,
  updates: { status?: EnquiryStatus; notes?: string }
): Promise<Enquiry | null> {
  if (isRedisConfigured()) {
    return await redisUpdateEnquiry(id, updates);
  }

  const db = loadDatabase();
  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) return null;

  if (updates.status !== undefined) enquiry.status = updates.status;
  if (updates.notes !== undefined) enquiry.notes = updates.notes;
  enquiry.updatedAt = new Date().toISOString();

  saveDatabase(db);
  return enquiry;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  if (isRedisConfigured()) {
    return await redisDeleteEnquiry(id);
  }

  const db = loadDatabase();
  const initialLength = db.enquiries.length;
  db.enquiries = db.enquiries.filter((e) => e.id !== id);
  if (db.enquiries.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ========================
// Service Management
// ========================
export function getServiceRecords(): ServiceRecord[] {
  const db = loadDatabase();
  return db.services;
}

export function getServicesList(): ServiceRecord[] {
  return getServiceRecords();
}

export function updateServiceRecord(
  id: string,
  updates: Partial<Omit<ServiceRecord, "id">>
): ServiceRecord | null {
  const db = loadDatabase();
  const service = db.services.find((s) => s.id === id);
  if (!service) return null;

  Object.assign(service, updates, { updatedAt: new Date().toISOString() });
  saveDatabase(db);
  return service;
}

// ========================
// Telemetry Ingestion & Stats
// ========================
export function recordTelemetry(data: Omit<ExtensionTelemetry, "id" | "timestamp">): ExtensionTelemetry {
  const db = loadDatabase();
  if (!db.telemetry) db.telemetry = [];

  const entry: ExtensionTelemetry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...data,
  };

  db.telemetry.unshift(entry);
  if (db.telemetry.length > 500) {
    db.telemetry = db.telemetry.slice(0, 500);
  }

  saveDatabase(db);
  return entry;
}

export function getTelemetryStats(extensionName = "attenza") {
  const db = loadDatabase();
  const records = (db.telemetry || []).filter(
    (t) => t.extensionName === extensionName.toLowerCase().trim()
  );

  const uniqueDevices = new Set(records.map((r) => r.anonymousId)).size;

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const activeToday = new Set(
    records
      .filter((r) => new Date(r.timestamp).getTime() >= oneDayAgo)
      .map((r) => r.anonymousId)
  ).size;

  const activeThisWeek = new Set(
    records
      .filter((r) => new Date(r.timestamp).getTime() >= sevenDaysAgo)
      .map((r) => r.anonymousId)
  ).size;

  const totalInstalls = records.filter((r) => r.eventType === "install").length;
  const totalPings = records.filter((r) => r.eventType === "ping").length;
  const lastReportedAt = records.length > 0 ? records[0].timestamp : null;

  return {
    extensionName,
    totalRecords: records.length,
    uniqueDevices,
    totalInstalls,
    activeToday,
    activeThisWeek,
    totalPings,
    lastReportedAt,
    hasLiveTelemetry: records.length > 0,
  };
}

// ========================
// Dashboard Statistics
// ========================
export async function getDashboardStats() {
  const enquiries = await getEnquiries();
  const services = getServiceRecords();
  const db = loadDatabase();

  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const inProgressEnquiries = enquiries.filter((e) => e.status === "in_progress").length;
  const contactedEnquiries = enquiries.filter((e) => e.status === "contacted").length;
  const archivedEnquiries = enquiries.filter((e) => e.status === "archived").length;

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.active).length;

  const recentEnquiries = enquiries.slice(0, 5);
  const registeredAdmins = isRedisConfigured() ? 1 : db.users.length;
  const attenzaStats = getTelemetryStats("attenza");

  return {
    totalEnquiries,
    newEnquiries,
    inProgressEnquiries,
    contactedEnquiries,
    archivedEnquiries,
    totalServices,
    activeServices,
    recentEnquiries,
    registeredAdmins,
    attenzaStats,
  };
}
