export type UserRole = "teacher" | "student" | "admin";

export interface AuthContext {
  clerkId: string;
  role?: UserRole;
}
