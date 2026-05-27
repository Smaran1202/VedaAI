import type { FilterQuery, SortOrder } from "mongoose";
import { env } from "../config/env";
import { isDatabaseConnected } from "../config/database";
import { ASSIGNMENT_STATUS } from "../constants/assignment.constants";
import { AssignmentModel } from "../models/assignment.model";
import { enqueueAssignmentGeneration } from "../queue/generation.queue";
import { emitAssignmentEvent } from "../socket";
import type { AssignmentQueryInput, CreateAssignmentInput } from "../validators/assignment.validator";
import { ApiError } from "../utils/apiError";
import { generateQuestionPaper } from "./ai.service";
import { wait } from "../utils/timing";
import {
  createMemoryAssignment,
  deleteMemoryAssignment,
  getMemoryAssignmentById,
  getMemoryAssignments,
  updateMemoryAssignment
} from "./memoryAssignment.repository";

export async function createAssignment(input: CreateAssignmentInput) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    const assignment = createMemoryAssignment(input);
    void runInlineMockGeneration(assignment.id);
    return assignment;
  }

  const assignment = await AssignmentModel.create({
    ...input,
    status: ASSIGNMENT_STATUS.QUEUED
  });
  const queued = await enqueueAssignmentGeneration(assignment.id);

  if (queued) {
    emitAssignmentEvent("assignment:queued", {
      assignmentId: assignment.id,
      status: ASSIGNMENT_STATUS.QUEUED,
      message: "Assignment generation queued"
    });
  } else {
    void runInlineMockGeneration(assignment.id);
  }

  return assignment;
}

async function runInlineMockGeneration(assignmentId: string) {
  emitAssignmentEvent("assignment:queued", {
    assignmentId,
    status: ASSIGNMENT_STATUS.QUEUED,
    message: "Assignment generation queued"
  });

  await wait(250);
  await markAssignmentProcessing(assignmentId);
  emitAssignmentEvent("assignment:processing", {
    assignmentId,
    status: ASSIGNMENT_STATUS.PROCESSING,
    message: "Generating assignment paper"
  });

  await wait(1200);
  const assignment = await getAssignmentById(assignmentId);
  const generatedPaper = await generateQuestionPaper(assignment);
  await completeAssignmentGeneration(assignmentId, generatedPaper);
  emitAssignmentEvent("assignment:completed", {
    assignmentId,
    status: ASSIGNMENT_STATUS.COMPLETED,
    message: "Assignment paper generated successfully"
  });
}

export async function getAssignments(query: AssignmentQueryInput) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return getMemoryAssignments(query);
  }

  const filter: FilterQuery<typeof AssignmentModel> = {};

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { subject: { $regex: query.search, $options: "i" } }
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, SortOrder> = {
    [query.sortBy]: query.sortOrder === "asc" ? 1 : -1
  };

  const [assignments, total] = await Promise.all([
    AssignmentModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    AssignmentModel.countDocuments(filter)
  ]);

  return {
    assignments,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}

export async function getAssignmentById(id: string) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return getMemoryAssignmentById(id);
  }

  const assignment = await AssignmentModel.findById(id).lean();

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return assignment;
}

export async function deleteAssignment(id: string) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return deleteMemoryAssignment(id);
  }

  const assignment = await AssignmentModel.findByIdAndDelete(id).lean();

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return assignment;
}

export async function markAssignmentProcessing(id: string) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return updateMemoryAssignment(id, { status: ASSIGNMENT_STATUS.PROCESSING });
  }

  const assignment = await AssignmentModel.findByIdAndUpdate(
    id,
    { status: ASSIGNMENT_STATUS.PROCESSING },
    { new: true }
  );

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return assignment;
}

export async function completeAssignmentGeneration(id: string, generatedPaper: unknown) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return updateMemoryAssignment(id, {
      status: ASSIGNMENT_STATUS.COMPLETED,
      generatedPaper
    });
  }

  const assignment = await AssignmentModel.findByIdAndUpdate(
    id,
    {
      status: ASSIGNMENT_STATUS.COMPLETED,
      generatedPaper
    },
    { new: true }
  );

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return assignment;
}

export async function markAssignmentFailed(id: string) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return updateMemoryAssignment(id, { status: ASSIGNMENT_STATUS.FAILED });
  }

  return AssignmentModel.findByIdAndUpdate(id, {
    status: ASSIGNMENT_STATUS.FAILED
  });
}

export async function regenerateAssignment(id: string) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    updateMemoryAssignment(id, {
      status: ASSIGNMENT_STATUS.QUEUED,
      generatedPaper: null
    });
    void runInlineMockGeneration(id);
    return { id, status: ASSIGNMENT_STATUS.QUEUED };
  }

  const assignment = await AssignmentModel.findByIdAndUpdate(
    id,
    {
      status: ASSIGNMENT_STATUS.QUEUED,
      generatedPaper: null
    },
    { new: true }
  );

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  const queued = await enqueueAssignmentGeneration(id);

  if (!queued) {
    void runInlineMockGeneration(id);
  } else {
    emitAssignmentEvent("assignment:queued", {
      assignmentId: id,
      status: ASSIGNMENT_STATUS.QUEUED,
      message: "Assignment regeneration queued"
    });
  }

  return { id, status: ASSIGNMENT_STATUS.QUEUED };
}

function ensureDevelopmentFallback() {
  if (env.nodeEnv === "production") {
    throw new ApiError(503, "Database unavailable", [{ database: "disconnected" }]);
  }
}
