export const ASSIGNMENT_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;

export const ASSIGNMENT_SORT_FIELDS = ["createdAt", "updatedAt", "dueDate", "title", "subject"] as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;
