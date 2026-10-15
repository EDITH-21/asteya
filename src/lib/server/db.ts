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

function loadDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const dbPath = getDatabasePath();
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, "utf-8");
      inMemoryDb = JSON.parse(raw);
      return inMemoryDb!;
    } catch (err) {
      console.error("[DB] Error reading database file, creating fresh store:", err);
    }
  }

  // Initial structure
  inMemoryDb = {
    version: 1,
    users: [],
    sessions: [],
    enquiries: [],
    services: [],
    failedLogins: [],
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
 * Initialize database with default admin user and service records if empty.
 */
export async function initializeDatabase(): Promise<void> {
  const db = loadDatabase();

  // 1. Seed admin if no users exist
  if (db.users.length === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@asteya.tech";
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || "Asteya#Secure2026!";
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
    console.log(`[DB] Initialized default admin account: ${adminEmail}`);
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

  // 3. Seed demo initial inquiry for operational testing if empty
  if (db.enquiries.length === 0) {
    db.enquiries.push({
      id: crypto.randomUUID(),
      name: "Marcus Aurelius",
      email: "marcus@stoictechnologies.io",
      type: "Digital Solutions",
      message: "Looking for an intelligent data pipeline and dashboard for real-time risk assessment across our distributed supply network.",
      status: "new",
      notes: "Lead sourced from direct referral. Priority evaluation.",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    });
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

  return {
    totalEnquiries,
    newEnquiries,
    inProgressEnquiries,
    contactedEnquiries,
    archivedEnquiries,
    totalServices,
    activeServices,
    recentEnquiries,
  };
}
