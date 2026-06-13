import { isDatabaseConnected } from "../config/database";
import { UserModel } from "../models/user.model";
import {
  getMemoryUserSummary,
  getMemoryUserByClerkId,
  upsertMemoryUser
} from "../repositories/memoryUser.repository";
import { AssignmentModel } from "../models/assignment.model";
import { countMemoryAssignments } from "../repositories/memoryAssignment.repository";
import type { UserRole } from "../types/auth.types";
import { ApiError } from "../utils/apiError";

export async function getUserByClerkId(clerkId: string) {
  if (!isDatabaseConnected()) {
    return getMemoryUserByClerkId(clerkId);
  }

  return UserModel.findOne({ clerkId }).lean();
}

export async function upsertCurrentUser(input: {
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  if (!isDatabaseConnected()) {
    return upsertMemoryUser(input);
  }

  return UserModel.findOneAndUpdate(
    { clerkId: input.clerkId },
    {
      $set: {
        email: input.email,
        name: input.name,
        role: input.role
      },
      $setOnInsert: {
        clerkId: input.clerkId
      }
    },
    { new: true, upsert: true, runValidators: true }
  ).lean();
}

export async function requireUserRole(clerkId: string) {
  const user = await getUserByClerkId(clerkId);

  if (!user) {
    throw new ApiError(403, "User onboarding required");
  }

  return user.role as UserRole;
}

export async function getPlatformSummary() {
  if (!isDatabaseConnected()) {
    return {
      ...getMemoryUserSummary(),
      totalAssignments: countMemoryAssignments()
    };
  }

  const [totalUsers, totalTeachers, totalStudents, totalAdmins, totalAssignments] =
    await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: "teacher" }),
      UserModel.countDocuments({ role: "student" }),
      UserModel.countDocuments({ role: "admin" }),
      AssignmentModel.countDocuments()
    ]);

  return {
    totalUsers,
    totalTeachers,
    totalStudents,
    totalAdmins,
    totalAssignments
  };
}
