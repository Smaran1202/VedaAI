import { verifyToken } from "@clerk/backend";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import * as userService from "../services/user.service";
import type { UserRole } from "../types/auth.types";
import { ApiError } from "../utils/apiError";

function readBearerToken(value?: string) {
  const [type, token] = value?.split(" ") ?? [];
  return type?.toLowerCase() === "bearer" && token ? token : null;
}

export const requireAuth: RequestHandler = async (request, _response, next) => {
  try {
    if (!env.clerkSecretKey) {
      throw new ApiError(503, "Clerk authentication is not configured");
    }

    const token = readBearerToken(request.headers.authorization);

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const payload = await verifyToken(token, {
      secretKey: env.clerkSecretKey
    });

    if (!payload.sub) {
      throw new ApiError(401, "Invalid authentication token");
    }

    request.auth = { clerkId: payload.sub };
    next();
  } catch (error) {
    next(error);
  }
};

export function requireRole(roles: UserRole[]): RequestHandler {
  return async (request, _response, next) => {
    try {
      const clerkId = request.auth?.clerkId;

      if (!clerkId) {
        throw new ApiError(401, "Authentication required");
      }

      const role = await userService.requireUserRole(clerkId);

      if (!roles.includes(role)) {
        throw new ApiError(403, "You do not have permission to perform this action");
      }

      request.auth = { clerkId, role };
      next();
    } catch (error) {
      next(error);
    }
  };
}
