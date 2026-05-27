import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    response.status(400).json({
      success: false,
      message: error.message,
      errors: []
    });
    return;
  }

  if (error instanceof Error && error.message.includes("uploads are supported")) {
    response.status(400).json({
      success: false,
      message: error.message,
      errors: []
    });
    return;
  }

  response.status(500).json({
    success: false,
    message: "Internal server error",
    errors: []
  });
};
