import type { WorkspaceProfileInput } from "../validators/workspaceProfile.validator";

export interface MemoryWorkspaceProfile extends WorkspaceProfileInput {
  id: string;
  _id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const profiles = new Map<string, MemoryWorkspaceProfile>();

export function getMemoryWorkspaceProfile(userId: string) {
  return profiles.get(userId) ?? null;
}

export function upsertMemoryWorkspaceProfile(userId: string, input: WorkspaceProfileInput) {
  const now = new Date();
  const existing = profiles.get(userId);
  const profile: MemoryWorkspaceProfile = {
    id: userId,
    _id: userId,
    userId,
    ...input,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  profiles.set(userId, profile);
  return profile;
}
