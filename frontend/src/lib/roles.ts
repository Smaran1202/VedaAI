import type { UserRole } from "@/types";

export function canCreateAssignments(role?: UserRole | null) {
  return role === "teacher" || role === "admin";
}

export function canRegeneratePapers(role?: UserRole | null) {
  return role === "teacher" || role === "admin";
}

export function canManageUsers(role?: UserRole | null) {
  return role === "admin";
}
