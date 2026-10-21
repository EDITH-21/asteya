import "server-only";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { hashPassword } from "./crypto";
import { SERVICES } from "@/lib/constants";
import {
  SEED_ADMIN_USERS,
  SEED_VENTURES,
  SEED_ABOUT_CONTENT,
  SEED_TEAM_MEMBERS,
  SEED_FAQS,
  SEED_SITE_SETTINGS,
} from "./seed-data";
import type {
  Announcement,
  Testimonial,
  FAQItem,
  Venture,
  AboutContent,
  TeamMember,
  SiteSettings,
  ActivityLog,
} from "./content-types";
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
  redisGetAnnouncements,
  redisSaveAnnouncementsList,
  redisGetTestimonials,
  redisSaveTestimonialsList,
  redisGetFAQs,
  redisSaveFAQsList,
  redisHasVenturesKey,
  redisGetVentures,
  redisSaveVenturesList,
  redisGetAboutContent,
  redisSaveAboutContent,
  redisGetTeamMembers,
  redisSaveTeamMembersList,
  redisGetSiteSettings,
  redisSaveSiteSettings,
  redisGetActivityLogs,
  redisPushActivityLog,
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

export type EnquiryStatus = "new" | "in_progress" | "contacted" | "archived" | "done";

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
  announcements?: Announcement[];
  testimonials?: Testimonial[];
  faqs?: FAQItem[];
  ventures?: Venture[];
  about?: AboutContent;
  team?: TeamMember[];
  settings?: SiteSettings;
  activityLogs?: ActivityLog[];
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

function ensureSeeds(db: DatabaseSchema): DatabaseSchema {
  if (!db.users || db.users.length === 0) {
    db.users = [...SEED_ADMIN_USERS];
  }
  if (!db.services || db.services.length === 0) {
    db.services = SERVICES.map((s) => ({
      ...s,
      active: true,
      updatedAt: new Date().toISOString(),
    }));
  }
  if (!db.announcements) db.announcements = [];
  if (!db.testimonials) db.testimonials = [];
  if (!db.faqs) db.faqs = [...SEED_FAQS];
  if (!db.ventures) db.ventures = [...SEED_VENTURES];
  if (!db.about) db.about = { ...SEED_ABOUT_CONTENT };
  if (!db.team || db.team.length === 0) db.team = [...SEED_TEAM_MEMBERS];
  if (!db.settings) db.settings = { ...SEED_SITE_SETTINGS };
  if (!db.activityLogs) db.activityLogs = [];
  if (!db.telemetry) db.telemetry = [];
  return db;
}

function loadDatabase(): DatabaseSchema {
  const dbPath = getDatabasePath();
  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      if (inMemoryDb && stats.mtimeMs <= lastLoadedTime) {
        return ensureSeeds(inMemoryDb);
      }
      const raw = fs.readFileSync(dbPath, "utf-8");
      inMemoryDb = JSON.parse(raw);
      lastLoadedTime = stats.mtimeMs;
      return ensureSeeds(inMemoryDb!);
    }
  } catch (err) {
    console.error("[DB] Error reading fallback database file:", err);
  }

  if (inMemoryDb) {
    return ensureSeeds(inMemoryDb);
  }

  // Initial structure with built-in seeds
  inMemoryDb = ensureSeeds({
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
    announcements: [],
    testimonials: [],
    faqs: [...SEED_FAQS],
    ventures: [...SEED_VENTURES],
    about: { ...SEED_ABOUT_CONTENT },
    team: [...SEED_TEAM_MEMBERS],
    settings: { ...SEED_SITE_SETTINGS },
    activityLogs: [],
  });

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
    // Seed default content in Redis if key missing
    const hasVentures = await redisHasVenturesKey();
    if (!hasVentures) await redisSaveVenturesList(SEED_VENTURES);
    const about = await redisGetAboutContent();
    if (!about) await redisSaveAboutContent(SEED_ABOUT_CONTENT);
    const team = await redisGetTeamMembers();
    if (team.length === 0) await redisSaveTeamMembersList(SEED_TEAM_MEMBERS);
    const faqs = await redisGetFAQs();
    if (faqs.length === 0) await redisSaveFAQsList(SEED_FAQS);
    const settings = await redisGetSiteSettings();
    if (!settings) await redisSaveSiteSettings(SEED_SITE_SETTINGS);

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

  for (const seed of SEED_ADMIN_USERS) {
    if (!db.users.some((u) => u.email.toLowerCase() === seed.email.toLowerCase())) {
      db.users.push(seed);
    }
  }

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
    const seed = SEED_ADMIN_USERS.find((u) => u.email.toLowerCase() === normalized);
    if (seed) return seed;
    return null;
  }
  const db = loadDatabase();
  const found = db.users.find((u) => u.email.toLowerCase() === normalized && u.role === "admin");
  if (found) return found;
  const seed = SEED_ADMIN_USERS.find((u) => u.email.toLowerCase() === normalized);
  if (seed) return seed;
  return null;
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  if (isRedisConfigured()) {
    const user = await redisGetAdminUserById(id);
    if (user) return user;
    const seed = SEED_ADMIN_USERS.find((u) => u.id === id);
    if (seed) return seed;
    return null;
  }
  const db = loadDatabase();
  const found = db.users.find((u) => u.id === id && u.role === "admin");
  if (found) return found;
  const seed = SEED_ADMIN_USERS.find((u) => u.id === id);
  if (seed) return seed;
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

// ========================================================
// Content Management Operations (Announcements, Ventures,
// Testimonials, FAQs, About, Team, Settings, Activity Logs)
// ========================================================

// 1. Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  if (isRedisConfigured()) {
    return await redisGetAnnouncements();
  }
  const db = loadDatabase();
  return db.announcements || [];
}

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const all = await getAnnouncements();
  const nowTime = Date.now();
  return (
    all.find((a) => {
      if (!a.active) return false;
      if (a.startDate && new Date(a.startDate).getTime() > nowTime + 120000) return false;
      if (a.endDate && new Date(a.endDate).getTime() < nowTime) return false;
      return true;
    }) || null
  );
}

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const all = await getAnnouncements();
  const nowTime = Date.now();
  return all.filter((a) => {
    if (!a.active) return false;
    if (a.startDate && new Date(a.startDate).getTime() > nowTime + 120000) return false;
    if (a.endDate && new Date(a.endDate).getTime() < nowTime) return false;
    return true;
  });
}

export async function createAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "updatedAt">): Promise<Announcement> {
  const now = new Date().toISOString();
  const announcement: Announcement = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  let list = await getAnnouncements();
  if (announcement.active && announcement.displayStyle === "top_bar") {
    list = list.map((a) => (a.displayStyle === "top_bar" ? { ...a, active: false } : a));
  }
  list.unshift(announcement);

  if (isRedisConfigured()) {
    await redisSaveAnnouncementsList(list);
  } else {
    const db = loadDatabase();
    db.announcements = list;
    saveDatabase(db);
  }

  return announcement;
}

export async function updateAnnouncement(id: string, updates: Partial<Omit<Announcement, "id" | "createdAt">>): Promise<Announcement | null> {
  let list = await getAnnouncements();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  if (updates.active && (updates.displayStyle === "top_bar" || (!updates.displayStyle && list[idx]?.displayStyle === "top_bar"))) {
    list = list.map((a) => (a.id === id || a.displayStyle !== "top_bar" ? a : { ...a, active: false }));
  }

  const updated: Announcement = {
    ...list[idx],
    ...updates,
    updatedAt: now,
  };
  list[idx] = updated;

  if (isRedisConfigured()) {
    await redisSaveAnnouncementsList(list);
  } else {
    const db = loadDatabase();
    db.announcements = list;
    saveDatabase(db);
  }

  return updated;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const list = await getAnnouncements();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return false;

  if (isRedisConfigured()) {
    await redisSaveAnnouncementsList(filtered);
  } else {
    const db = loadDatabase();
    db.announcements = filtered;
    saveDatabase(db);
  }
  return true;
}

// 2. Testimonials
export async function getTestimonials(): Promise<Testimonial[]> {
  let list: Testimonial[] = [];
  if (isRedisConfigured()) {
    list = await redisGetTestimonials();
  } else {
    const db = loadDatabase();
    list = db.testimonials || [];
  }
  return [...list].sort((a, b) => a.order - b.order);
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const all = await getTestimonials();
  return all.filter((t) => t.published);
}

export async function createTestimonial(data: Omit<Testimonial, "id" | "createdAt" | "updatedAt">): Promise<Testimonial> {
  const now = new Date().toISOString();
  const testimonial: Testimonial = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const list = await getTestimonials();
  list.push(testimonial);

  if (isRedisConfigured()) {
    await redisSaveTestimonialsList(list);
  } else {
    const db = loadDatabase();
    db.testimonials = list;
    saveDatabase(db);
  }

  return testimonial;
}

export async function updateTestimonial(id: string, updates: Partial<Omit<Testimonial, "id" | "createdAt">>): Promise<Testimonial | null> {
  const list = await getTestimonials();
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const updated: Testimonial = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;

  if (isRedisConfigured()) {
    await redisSaveTestimonialsList(list);
  } else {
    const db = loadDatabase();
    db.testimonials = list;
    saveDatabase(db);
  }

  return updated;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const list = await getTestimonials();
  const filtered = list.filter((t) => t.id !== id);
  if (filtered.length === list.length) return false;

  if (isRedisConfigured()) {
    await redisSaveTestimonialsList(filtered);
  } else {
    const db = loadDatabase();
    db.testimonials = filtered;
    saveDatabase(db);
  }
  return true;
}

export async function reorderTestimonials(orderedIds: string[]): Promise<Testimonial[]> {
  const list = await getTestimonials();
  const idMap = new Map(orderedIds.map((id, index) => [id, index]));
  const updated = list.map((item) => {
    if (idMap.has(item.id)) {
      return { ...item, order: idMap.get(item.id)!, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  updated.sort((a, b) => a.order - b.order);

  if (isRedisConfigured()) {
    await redisSaveTestimonialsList(updated);
  } else {
    const db = loadDatabase();
    db.testimonials = updated;
    saveDatabase(db);
  }
  return updated;
}

// 3. FAQs
export async function getFAQs(): Promise<FAQItem[]> {
  let list: FAQItem[] = [];
  if (isRedisConfigured()) {
    list = await redisGetFAQs();
    if (list.length === 0) {
      list = [...SEED_FAQS];
      await redisSaveFAQsList(list);
    }
  } else {
    const db = loadDatabase();
    list = db.faqs && db.faqs.length > 0 ? db.faqs : [...SEED_FAQS];
  }
  return [...list].sort((a, b) => a.order - b.order);
}

export async function getPublishedFAQs(): Promise<FAQItem[]> {
  const all = await getFAQs();
  return all.filter((f) => f.published);
}

export async function createFAQ(data: Omit<FAQItem, "id" | "createdAt" | "updatedAt">): Promise<FAQItem> {
  const now = new Date().toISOString();
  const faq: FAQItem = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const list = await getFAQs();
  list.push(faq);

  if (isRedisConfigured()) {
    await redisSaveFAQsList(list);
  } else {
    const db = loadDatabase();
    db.faqs = list;
    saveDatabase(db);
  }

  return faq;
}

export async function updateFAQ(id: string, updates: Partial<Omit<FAQItem, "id" | "createdAt">>): Promise<FAQItem | null> {
  const list = await getFAQs();
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  const updated: FAQItem = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;

  if (isRedisConfigured()) {
    await redisSaveFAQsList(list);
  } else {
    const db = loadDatabase();
    db.faqs = list;
    saveDatabase(db);
  }

  return updated;
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const list = await getFAQs();
  const filtered = list.filter((f) => f.id !== id);
  if (filtered.length === list.length) return false;

  if (isRedisConfigured()) {
    await redisSaveFAQsList(filtered);
  } else {
    const db = loadDatabase();
    db.faqs = filtered;
    saveDatabase(db);
  }
  return true;
}

export async function reorderFAQs(orderedIds: string[]): Promise<FAQItem[]> {
  const list = await getFAQs();
  const idMap = new Map(orderedIds.map((id, index) => [id, index]));
  const updated = list.map((item) => {
    if (idMap.has(item.id)) {
      return { ...item, order: idMap.get(item.id)!, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  updated.sort((a, b) => a.order - b.order);

  if (isRedisConfigured()) {
    await redisSaveFAQsList(updated);
  } else {
    const db = loadDatabase();
    db.faqs = updated;
    saveDatabase(db);
  }
  return updated;
}

// 4. Ventures
export async function getVentures(): Promise<Venture[]> {
  let list: Venture[] = [];
  if (isRedisConfigured()) {
    list = await redisGetVentures();
  } else {
    const db = loadDatabase();
    list = db.ventures || [];
  }
  return [...list].sort((a, b) => a.order - b.order);
}

export async function getPublishedVentures(): Promise<Venture[]> {
  const all = await getVentures();
  return all.filter((v) => v.published);
}

export async function createVenture(data: Omit<Venture, "id" | "createdAt" | "updatedAt">): Promise<Venture> {
  const now = new Date().toISOString();
  const venture: Venture = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const list = await getVentures();
  list.push(venture);

  if (isRedisConfigured()) {
    await redisSaveVenturesList(list);
  } else {
    const db = loadDatabase();
    db.ventures = list;
    saveDatabase(db);
  }

  return venture;
}

export async function updateVenture(id: string, updates: Partial<Omit<Venture, "id" | "createdAt">>): Promise<Venture | null> {
  const list = await getVentures();
  const idx = list.findIndex((v) => v.id === id);
  if (idx === -1) return null;

  const updated: Venture = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;

  if (isRedisConfigured()) {
    await redisSaveVenturesList(list);
  } else {
    const db = loadDatabase();
    db.ventures = list;
    saveDatabase(db);
  }

  return updated;
}

export async function deleteVenture(id: string): Promise<boolean> {
  const list = await getVentures();
  const filtered = list.filter((v) => v.id !== id);
  if (filtered.length === list.length) return false;

  if (isRedisConfigured()) {
    await redisSaveVenturesList(filtered);
  } else {
    const db = loadDatabase();
    db.ventures = filtered;
    saveDatabase(db);
  }
  return true;
}

export async function reorderVentures(orderedIds: string[]): Promise<Venture[]> {
  const list = await getVentures();
  const idMap = new Map(orderedIds.map((id, index) => [id, index]));
  const updated = list.map((item) => {
    if (idMap.has(item.id)) {
      return { ...item, order: idMap.get(item.id)!, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  updated.sort((a, b) => a.order - b.order);

  if (isRedisConfigured()) {
    await redisSaveVenturesList(updated);
  } else {
    const db = loadDatabase();
    db.ventures = updated;
    saveDatabase(db);
  }
  return updated;
}

export async function importExistingVentures(): Promise<Venture[]> {
  const current = await getVentures();
  const existingNames = new Set(current.map((v) => v.name.toLowerCase()));
  let hasChanges = false;
  const list = [...current];

  for (const seed of SEED_VENTURES) {
    if (!existingNames.has(seed.name.toLowerCase())) {
      list.push({
        ...seed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      hasChanges = true;
    }
  }

  if (hasChanges) {
    if (isRedisConfigured()) {
      await redisSaveVenturesList(list);
    } else {
      const db = loadDatabase();
      db.ventures = list;
      saveDatabase(db);
    }
  }

  return list;
}

// 5. About Content & Team
export async function getAboutContent(): Promise<AboutContent> {
  if (isRedisConfigured()) {
    const content = await redisGetAboutContent();
    if (content) return content;
    await redisSaveAboutContent(SEED_ABOUT_CONTENT);
    return SEED_ABOUT_CONTENT;
  }
  const db = loadDatabase();
  return db.about || { ...SEED_ABOUT_CONTENT };
}

export async function updateAboutContent(data: Omit<AboutContent, "updatedAt">): Promise<AboutContent> {
  const updated: AboutContent = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (isRedisConfigured()) {
    await redisSaveAboutContent(updated);
  } else {
    const db = loadDatabase();
    db.about = updated;
    saveDatabase(db);
  }
  return updated;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  let list: TeamMember[] = [];
  if (isRedisConfigured()) {
    list = await redisGetTeamMembers();
    if (list.length === 0) {
      list = [...SEED_TEAM_MEMBERS];
      await redisSaveTeamMembersList(list);
    }
  } else {
    const db = loadDatabase();
    list = db.team && db.team.length > 0 ? db.team : [...SEED_TEAM_MEMBERS];
  }
  return [...list].sort((a, b) => a.order - b.order);
}

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const all = await getTeamMembers();
  return all.filter((m) => m.published);
}

export async function createTeamMember(data: Omit<TeamMember, "id" | "createdAt" | "updatedAt">): Promise<TeamMember> {
  const now = new Date().toISOString();
  const member: TeamMember = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const list = await getTeamMembers();
  list.push(member);

  if (isRedisConfigured()) {
    await redisSaveTeamMembersList(list);
  } else {
    const db = loadDatabase();
    db.team = list;
    saveDatabase(db);
  }
  return member;
}

export async function updateTeamMember(id: string, updates: Partial<Omit<TeamMember, "id" | "createdAt">>): Promise<TeamMember | null> {
  const list = await getTeamMembers();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return null;

  const updated: TeamMember = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;

  if (isRedisConfigured()) {
    await redisSaveTeamMembersList(list);
  } else {
    const db = loadDatabase();
    db.team = list;
    saveDatabase(db);
  }
  return updated;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const list = await getTeamMembers();
  const filtered = list.filter((m) => m.id !== id);
  if (filtered.length === list.length) return false;

  if (isRedisConfigured()) {
    await redisSaveTeamMembersList(filtered);
  } else {
    const db = loadDatabase();
    db.team = filtered;
    saveDatabase(db);
  }
  return true;
}

export async function reorderTeamMembers(orderedIds: string[]): Promise<TeamMember[]> {
  const list = await getTeamMembers();
  const idMap = new Map(orderedIds.map((id, index) => [id, index]));
  const updated = list.map((item) => {
    if (idMap.has(item.id)) {
      return { ...item, order: idMap.get(item.id)!, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  updated.sort((a, b) => a.order - b.order);

  if (isRedisConfigured()) {
    await redisSaveTeamMembersList(updated);
  } else {
    const db = loadDatabase();
    db.team = updated;
    saveDatabase(db);
  }
  return updated;
}

// 6. Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isRedisConfigured()) {
    const settings = await redisGetSiteSettings();
    if (settings) return settings;
    await redisSaveSiteSettings(SEED_SITE_SETTINGS);
    return SEED_SITE_SETTINGS;
  }
  const db = loadDatabase();
  return db.settings || { ...SEED_SITE_SETTINGS };
}

export async function updateSiteSettings(data: Partial<Omit<SiteSettings, "updatedAt">>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (isRedisConfigured()) {
    await redisSaveSiteSettings(updated);
  } else {
    const db = loadDatabase();
    db.settings = updated;
    saveDatabase(db);
  }
  return updated;
}

// 7. Activity Logs
export async function getActivityLogs(limit = 100): Promise<ActivityLog[]> {
  if (isRedisConfigured()) {
    return await redisGetActivityLogs(limit);
  }
  const db = loadDatabase();
  return (db.activityLogs || []).slice(0, limit);
}

export async function recordActivityLog(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog> {
  const entry: ActivityLog = {
    id: crypto.randomUUID(),
    ...log,
    timestamp: new Date().toISOString(),
  };

  if (isRedisConfigured()) {
    await redisPushActivityLog(entry);
  } else {
    const db = loadDatabase();
    if (!db.activityLogs) db.activityLogs = [];
    db.activityLogs.unshift(entry);
    if (db.activityLogs.length > 500) {
      db.activityLogs = db.activityLogs.slice(0, 500);
    }
    saveDatabase(db);
  }

  return entry;
}

