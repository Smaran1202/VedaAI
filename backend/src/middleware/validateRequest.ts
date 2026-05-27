import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";

export function validateRequest(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(
        new ApiError(
          400,
          "Validation failed",
          result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        )
      );
      return;
    }

    request.body = result.data;
    next();
  };
}
