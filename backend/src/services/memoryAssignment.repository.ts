import { randomUUID } from "crypto";
import { ASSIGNMENT_STATUS } from "../constants/assignment.constants";
import type { AssignmentQueryInput, CreateAssignmentInput } from "../validators/assignment.validator";
import { ApiError } from "../utils/apiError";

export interface MemoryAssignmentRecord extends CreateAssignmentInput {
  id: string;
  _id: string;
  status: "queued" | "processing" | "completed" | "failed";
  generatedPaper: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const assignments = new Map<string, MemoryAssignmentRecord>();
let hasLoggedMemoryStorage = false;

export function logMemoryStorageUsage() {
  if (!hasLoggedMemoryStorage) {
    console.info("Using mock storage because database unavailable");
    hasLoggedMemoryStorage = true;
  }
}

export function createMemoryAssignment(input: CreateAssignmentInput) {
  logMemoryStorageUsage();

  const now = new Date();
  const id = randomUUID();
  const assignment: MemoryAssignmentRecord = {
    ...input,
    id,
    _id: id,
    status: ASSIGNMENT_STATUS.QUEUED,
    generatedPaper: null,
    createdAt: now,
    updatedAt: now
  };

  assignments.set(id, assignment);
  return assignment;
}

export function getMemoryAssignments(query: AssignmentQueryInput) {
  logMemoryStorageUsage();

  const search = query.search?.toLowerCase();
  const filtered = Array.from(assignments.values()).filter((assignment) => {
    if (!search) {
      return true;
    }

    return (
      assignment.title.toLowerCase().includes(search) ||
      assignment.subject.toLowerCase().includes(search)
    );
  });

  filtered.sort((left, right) => {
    const leftValue = left[query.sortBy];
    const rightValue = right[query.sortBy];
    const direction = query.sortOrder === "asc" ? 1 : -1;

    if (leftValue instanceof Date && rightValue instanceof Date) {
      return (leftValue.getTime() - rightValue.getTime()) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });

  const skip = (query.page - 1) * query.limit;
  const paginated = filtered.slice(skip, skip + query.limit);

  return {
    assignments: paginated,
    meta: {
      page: query.page,
      limit: query.limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / query.limit)
    }
  };
}

export function getMemoryAssignmentById(id: string) {
  logMemoryStorageUsage();

  const assignment = assignments.get(id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return assignment;
}

export function deleteMemoryAssignment(id: string) {
  logMemoryStorageUsage();

  const assignment = assignments.get(id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  assignments.delete(id);
  return assignment;
}

export function updateMemoryAssignment(
  id: string,
  patch: Partial<Pick<MemoryAssignmentRecord, "status" | "generatedPaper">>
) {
  logMemoryStorageUsage();

  const assignment = assignments.get(id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  const updated = {
    ...assignment,
    ...patch,
    updatedAt: new Date()
  };

  assignments.set(id, updated);
  return updated;
}
