import { api } from "@/services/api";
import type { CurrentUser, PlatformSummary, UserRole } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getCurrentUser() {
  const response = await api.get<
    ApiResponse<{ user: CurrentUser | null; needsOnboarding: boolean }>
  >("/api/users/me");
  return response.data.data;
}

export async function completeOnboarding(input: {
  email: string;
  name: string;
  role: UserRole;
}) {
  const response = await api.post<ApiResponse<{ user: CurrentUser }>>(
    "/api/users/onboarding",
    input
  );
  return response.data.data.user;
}

export async function getPlatformSummary() {
  const response = await api.get<ApiResponse<PlatformSummary>>("/api/users/summary");
  return response.data.data;
}
