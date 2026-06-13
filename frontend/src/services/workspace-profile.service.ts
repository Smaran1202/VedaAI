import { api } from "@/services/api";
import type { WorkspaceProfile } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type WorkspaceProfilePayload = {
  schoolName: string;
  city: string;
  board?: string;
  academicYear?: string;
  defaultClass?: string;
};

export async function getWorkspaceProfile() {
  const response = await api.get<ApiResponse<{ profile: WorkspaceProfile | null }>>(
    "/api/workspace/profile"
  );
  return response.data.data.profile;
}

export async function saveWorkspaceProfile(payload: WorkspaceProfilePayload) {
  const response = await api.put<ApiResponse<{ profile: WorkspaceProfile }>>(
    "/api/workspace/profile",
    payload
  );
  return response.data.data.profile;
}
