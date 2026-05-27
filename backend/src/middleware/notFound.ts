import type { RequestHandler } from "express";
import { ApiError } from "../utils/apiError";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new ApiError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};
