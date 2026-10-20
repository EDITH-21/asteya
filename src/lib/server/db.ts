import fs from "fs";
import path from "path";
import crypto from "crypto";
import { hashPassword } from "./crypto";
import { SERVICES } from "@/lib/constants";

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
      return inMemoryDb!;
    }
  } catch (err) {
    console.error("[DB] Error reading database file, using fallback:", err);
  }

  if (inMemoryDb) {
    if (!inMemoryDb.telemetry) inMemoryDb.telemetry = [];
    return inMemoryDb;
  }

  // Initial structure
  inMemoryDb = {
    version: 1,
    users: [],
    sessions: [],
    enquiries: [],
    services: [],
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
    console.error("[DB] Error saving database file:", err);
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
 * Never uses a hardcoded fallback password.
 */
export async function initializeDatabase(): Promise<void> {
  const db = loadDatabase();

  // 1. Seed admin if no users exist AND explicit password is provided in env
  if (db.users.length === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@asteya.tech";
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (initialPassword && initialPassword.length >= 10) {
      const { hash, salt } = await hashPassword(initialPassword);

      const defaultAdmin: AdminUser = {
        id: crypto.randomUUID(),
        email: adminEmail.toLowerCase().trim(),
        username: "Asteya Admin",
        passwordHash: hash,
        passwordSalt: salt,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.users.push(defaultAdmin);
      console.log("[DB] Initialized default administrator account securely.");
    } else {
      console.warn(
        "[DB] No administrator accounts registered. Set ADMIN_INITIAL_PASSWORD (min 10 chars) or execute 'npm run seed:admin <email> <password>' to securely configure credentials."
      );
    }
  }

  // 2. Seed services if none exist
  if (db.services.length === 0) {
    const defaultServices: ServiceRecord[] = SERVICES.map((s) => ({
      ...s,
      active: true,
      updatedAt: new Date().toISOString(),
    }));
    db.services = defaultServices;
  }

  saveDatabase(db);
}

// ========================
// Rate Limiting (Brute Force Protection)
// ========================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string, identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
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

  // Expired lockout
  if (attempt.lockedUntil && attempt.lockedUntil <= now) {
    attempt.count = 0;
    attempt.lockedUntil = undefined;
    saveDatabase(db);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string, identifier: string): void {
  const db = loadDatabase();
  const key = `${ip}:${identifier.toLowerCase().trim()}`;
  const now = Date.now();

  let attempt = db.failedLogins.find((a) => a.key === key);
  if (!attempt) {
    attempt = { key, count: 1, lastAttempt: now };
    db.failedLogins.push(attempt);
  } else {
    // If last attempt was more than 15 mins ago, reset count
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

export function resetLoginAttempts(ip: string, identifier: string): void {
  const db = loadDatabase();
  const key = `${ip}:${identifier.toLowerCase().trim()}`;
  db.failedLogins = db.failedLogins.filter((a) => a.key !== key);
  saveDatabase(db);
}

// ========================
// User / Auth Operations
// ========================
export function getAdminByEmail(email: string): AdminUser | null {
  const db = loadDatabase();
  const normalized = email.toLowerCase().trim();
  return db.users.find((u) => u.email === normalized && u.role === "admin") || null;
}

export function getAdminById(id: string): AdminUser | null {
  const db = loadDatabase();
  return db.users.find((u) => u.id === id && u.role === "admin") || null;
}

export function updateAdminPassword(id: string, hash: string, salt: string): boolean {
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === id);
  if (!user) return false;

  user.passwordHash = hash;
  user.passwordSalt = salt;
  user.updatedAt = new Date().toISOString();

  // Invalidate all active sessions for this user on password change
  db.sessions = db.sessions.filter((s) => s.userId !== id);

  saveDatabase(db);
  return true;
}

export function updateAdminLastLogin(id: string): void {
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
export function createSession(
  userId: string,
  sessionTokenHash: string,
  expiresAt: string,
  ipAddress?: string,
  userAgent?: string
): AdminSession {
  const db = loadDatabase();
  const session: AdminSession = {
    id: crypto.randomUUID(),
    sessionTokenHash,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt,
    ipAddress,
    userAgent,
  };
  db.sessions.push(session);
  saveDatabase(db);
  return session;
}

export function getSessionByTokenHash(tokenHash: string): AdminSession | null {
  const db = loadDatabase();
  const now = new Date().toISOString();
  const session = db.sessions.find((s) => s.sessionTokenHash === tokenHash);
  if (!session) return null;

  // Check expiration
  if (session.expiresAt <= now) {
    deleteSession(tokenHash);
    return null;
  }

  return session;
}

export function deleteSession(tokenHash: string): void {
  const db = loadDatabase();
  db.sessions = db.sessions.filter((s) => s.sessionTokenHash !== tokenHash);
  saveDatabase(db);
}

export function deleteUserSessions(userId: string): void {
  const db = loadDatabase();
  db.sessions = db.sessions.filter((s) => s.userId !== userId);
  saveDatabase(db);
}

// ========================
// Enquiry Management
// ========================
export function createEnquiry(data: {
  name: string;
  email: string;
  type: string;
  message: string;
  ipAddress?: string;
}): Enquiry {
  const db = loadDatabase();
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

  db.enquiries.unshift(enquiry); // newest first
  saveDatabase(db);
  return enquiry;
}

export function getEnquiries(params?: {
  status?: string;
  search?: string;
  type?: string;
}): Enquiry[] {
  const db = loadDatabase();
  let list = [...db.enquiries];

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

export function getEnquiryById(id: string): Enquiry | null {
  const db = loadDatabase();
  return db.enquiries.find((e) => e.id === id) || null;
}

export function updateEnquiry(
  id: string,
  updates: { status?: EnquiryStatus; notes?: string }
): Enquiry | null {
  const db = loadDatabase();
  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) return null;

  if (updates.status !== undefined) {
    enquiry.status = updates.status;
  }
  if (updates.notes !== undefined) {
    enquiry.notes = updates.notes;
  }
  enquiry.updatedAt = new Date().toISOString();

  saveDatabase(db);
  return enquiry;
}

export function deleteEnquiry(id: string): boolean {
  const db = loadDatabase();
  const initialLen = db.enquiries.length;
  db.enquiries = db.enquiries.filter((e) => e.id !== id);
  if (db.enquiries.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ========================
// Services Management
// ========================
export function getServicesList(): ServiceRecord[] {
  const db = loadDatabase();
  return db.services;
}

export function updateServiceRecord(
  id: string,
  updates: Partial<Pick<ServiceRecord, "title" | "tagline" | "description" | "capabilities" | "active">>
): ServiceRecord | null {
  const db = loadDatabase();
  const service = db.services.find((s) => s.id === id);
  if (!service) return null;

  if (updates.title !== undefined) service.title = updates.title;
  if (updates.tagline !== undefined) service.tagline = updates.tagline;
  if (updates.description !== undefined) service.description = updates.description;
  if (updates.capabilities !== undefined) service.capabilities = updates.capabilities;
  if (updates.active !== undefined) service.active = updates.active;
  service.updatedAt = new Date().toISOString();

  saveDatabase(db);
  return service;
}

// ========================
// Telemetry & Extension Usage Tracking
// ========================
export function recordTelemetry(data: {
  extensionName: string;
  version: string;
  eventType: "install" | "ping" | "session_start" | "feature_use";
  anonymousId: string;
  metadata?: Record<string, string | number | boolean>;
}): ExtensionTelemetry {
  const db = loadDatabase();
  if (!db.telemetry) {
    db.telemetry = [];
  }

  const record: ExtensionTelemetry = {
    id: crypto.randomUUID(),
    extensionName: (data.extensionName || "attenza").toLowerCase().trim(),
    version: data.version || "1.0.0",
    eventType: data.eventType,
    anonymousId: data.anonymousId,
    timestamp: new Date().toISOString(),
    metadata: data.metadata,
  };

  db.telemetry.push(record);

  // Keep a sliding window of recent telemetry (capped at 5,000 events to avoid unbounded file growth)
  if (db.telemetry.length > 5000) {
    db.telemetry = db.telemetry.slice(-5000);
  }

  saveDatabase(db);
  return record;
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
  const lastReportedAt = records.length > 0 ? records[records.length - 1].timestamp : null;

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
export function getDashboardStats() {
  const db = loadDatabase();
  const totalEnquiries = db.enquiries.length;
  const newEnquiries = db.enquiries.filter((e) => e.status === "new").length;
  const inProgressEnquiries = db.enquiries.filter((e) => e.status === "in_progress").length;
  const contactedEnquiries = db.enquiries.filter((e) => e.status === "contacted").length;
  const archivedEnquiries = db.enquiries.filter((e) => e.status === "archived").length;

  const totalServices = db.services.length;
  const activeServices = db.services.filter((s) => s.active).length;

  const recentEnquiries = db.enquiries.slice(0, 5);
  const registeredAdmins = db.users.length;
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
