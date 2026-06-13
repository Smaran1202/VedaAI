import type { UserRole } from "../types/auth.types";

export interface MemoryUserRecord {
  id: string;
  _id: string;
  clerkId: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const users = new Map<string, MemoryUserRecord>();
let hasLoggedMemoryUsers = false;

function logMemoryUserUsage() {
  if (!hasLoggedMemoryUsers) {
    console.info("Using development fallback user storage because database is unavailable");
    hasLoggedMemoryUsers = true;
  }
}

export function getMemoryUserByClerkId(clerkId: string) {
  logMemoryUserUsage();
  return users.get(clerkId) ?? null;
}

export function upsertMemoryUser(input: {
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  logMemoryUserUsage();
  const now = new Date();
  const existing = users.get(input.clerkId);
  const user: MemoryUserRecord = {
    id: input.clerkId,
    _id: input.clerkId,
    clerkId: input.clerkId,
    email: input.email,
    name: input.name,
    role: input.role,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  users.set(input.clerkId, user);
  return user;
}

export function getMemoryUserSummary() {
  logMemoryUserUsage();

  const records = Array.from(users.values());

  return {
    totalUsers: records.length,
    totalTeachers: records.filter((user) => user.role === "teacher").length,
    totalStudents: records.filter((user) => user.role === "student").length,
    totalAdmins: records.filter((user) => user.role === "admin").length
  };
}
