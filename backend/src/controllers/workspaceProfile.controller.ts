import type { RequestHandler } from "express";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as workspaceProfileService from "../services/workspaceProfile.service";
import { workspaceProfileSchema } from "../validators/workspaceProfile.validator";

export const getWorkspaceProfile: RequestHandler = asyncHandler(async (request, response) => {
  const userId = request.auth?.clerkId;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const profile = await workspaceProfileService.getWorkspaceProfile(userId);

  sendSuccess(response, {
    message: "Workspace profile fetched successfully",
    data: {
      profile
    }
  });
});

export const updateWorkspaceProfile: RequestHandler = asyncHandler(async (request, response) => {
  const userId = request.auth?.clerkId;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const input = workspaceProfileSchema.parse(request.body);
  const profile = await workspaceProfileService.upsertWorkspaceProfile(userId, input);

  sendSuccess(response, {
    message: "Workspace profile saved successfully",
    data: {
      profile
    }
  });
});
