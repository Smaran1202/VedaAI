import type { NextFunction, Request, Response } from "express";

export type AsyncController = (request: Request, response: Response, next: NextFunction) => Promise<void>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
