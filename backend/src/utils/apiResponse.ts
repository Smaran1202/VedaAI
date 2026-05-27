import type { Response } from "express";
import type { PaginationMeta } from "../types/api.types";

interface SuccessOptions<T> {
  message: string;
  data?: T;
  statusCode?: number;
  meta?: PaginationMeta;
}

export function sendSuccess<T>(response: Response, options: SuccessOptions<T>) {
  const { statusCode = 200, message, data, meta } = options;

  return response.status(statusCode).json({
    success: true,
    message,
    data: data ?? {},
    ...(meta ? { meta } : {})
  });
}
