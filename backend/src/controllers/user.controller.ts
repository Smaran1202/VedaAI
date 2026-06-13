import type { RequestHandler } from "express";
import { onboardingSchema } from "../validators/user.validator";
import * as userService from "../services/user.service";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const getCurrentUser: RequestHandler = asyncHandler(async (request, response) => {
  const clerkId = request.auth?.clerkId;

  if (!clerkId) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await userService.getUserByClerkId(clerkId);

  sendSuccess(response, {
    message: "Current user fetched successfully",
    data: {
      user,
      needsOnboarding: !user
    }
  });
});

export const completeOnboarding: RequestHandler = asyncHandler(async (request, response) => {
  const clerkId = request.auth?.clerkId;

  if (!clerkId) {
    throw new ApiError(401, "Authentication required");
  }

  const input = onboardingSchema.parse(request.body);
  const user = await userService.upsertCurrentUser({
    clerkId,
    ...input
  });

  sendSuccess(response, {
    statusCode: 201,
    message: "User onboarding completed",
    data: { user }
  });
});

export const getPlatformSummary: RequestHandler = asyncHandler(async (_request, response) => {
  const summary = await userService.getPlatformSummary();

  sendSuccess(response, {
    message: "Platform summary fetched successfully",
    data: summary
  });
});
