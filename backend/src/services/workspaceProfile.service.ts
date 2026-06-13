import { isDatabaseConnected } from "../config/database";
import { WorkspaceProfileModel } from "../models/workspaceProfile.model";
import {
  getMemoryWorkspaceProfile,
  upsertMemoryWorkspaceProfile
} from "../repositories/memoryWorkspaceProfile.repository";
import type { WorkspaceProfileInput } from "../validators/workspaceProfile.validator";

export async function getWorkspaceProfile(userId: string) {
  if (!isDatabaseConnected()) {
    return getMemoryWorkspaceProfile(userId);
  }

  return WorkspaceProfileModel.findOne({ userId }).lean();
}

export async function upsertWorkspaceProfile(userId: string, input: WorkspaceProfileInput) {
  if (!isDatabaseConnected()) {
    return upsertMemoryWorkspaceProfile(userId, input);
  }

  return WorkspaceProfileModel.findOneAndUpdate(
    { userId },
    {
      $set: input,
      $setOnInsert: { userId }
    },
    { new: true, upsert: true, runValidators: true }
  ).lean();
}

export function formatWorkspaceSchool(profile?: { schoolName?: string; city?: string; board?: string } | null) {
  if (!profile?.schoolName) {
    return "Your School";
  }

  return [profile.schoolName, profile.city, profile.board].filter(Boolean).join(", ");
}
