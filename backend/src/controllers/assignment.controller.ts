import type { RequestHandler } from "express";
import {
  assignmentQuerySchema,
  improveQuestionSchema,
  paperQuestionSchema,
  restorePaperVersionSchema,
  updatePaperQuestionSchema,
  type CreateAssignmentInput
} from "../validators/assignment.validator";
import * as assignmentService from "../services/assignment.service";
import { extractUploadedContent } from "../services/documentExtraction.service";
import { generateAssignmentPdf } from "../services/pdf.service";
import { formatWorkspaceSchool, getWorkspaceProfile } from "../services/workspaceProfile.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { readStringParam } from "../utils/requestParams";

export const createAssignment: RequestHandler = asyncHandler(async (request, response) => {
  const fileUrl = request.file ? request.file.originalname : request.body.fileUrl;
  const extractedContent = request.file ? await extractUploadedContent(request.file) : "";
  const workspaceProfile = request.auth?.clerkId
    ? await getWorkspaceProfile(request.auth.clerkId)
    : null;
  const school = request.body.school?.trim() || formatWorkspaceSchool(workspaceProfile);
  const payload: CreateAssignmentInput = {
    ...request.body,
    school,
    ownerId: request.auth?.clerkId,
    fileUrl,
    extractedContent
  };
  console.info("[assignment:create]", {
    subject: payload.subject,
    chapter: payload.chapter,
    className: payload.className || payload.classSection,
    instructions: payload.instructions
  });
  const assignment = await assignmentService.createAssignment(payload);

  sendSuccess(response, {
    statusCode: 201,
    message: "Assignment created successfully",
    data: { id: assignment.id, status: assignment.status }
  });
});

export const getAssignments: RequestHandler = asyncHandler(async (request, response) => {
  const query = assignmentQuerySchema.parse(request.query);
  const result = await assignmentService.getAssignments(query, request.auth?.clerkId, request.auth?.role);

  sendSuccess(response, {
    message: "Assignments fetched successfully",
    data: result.assignments,
    meta: result.meta
  });
});

export const getAssignmentById: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  const assignment = await assignmentService.getAssignmentById(id, request.auth?.clerkId, request.auth?.role);

  sendSuccess(response, {
    message: "Assignment fetched successfully",
    data: assignment
  });
});

export const deleteAssignment: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  await assignmentService.deleteAssignment(id, request.auth?.clerkId, request.auth?.role);

  sendSuccess(response, {
    message: "Assignment deleted successfully",
    data: { id }
  });
});

export const regenerateAssignment: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  const result = await assignmentService.regenerateAssignment(id, request.auth?.clerkId, request.auth?.role);

  sendSuccess(response, {
    message: "Assignment regeneration queued successfully",
    data: result
  });
});

export const downloadAssignmentPdf: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  const assignment = await assignmentService.getAssignmentById(id, request.auth?.clerkId, request.auth?.role);
  const pdf = await generateAssignmentPdf(assignment);

  response.setHeader("Content-Type", "application/pdf");
  response.setHeader("Content-Disposition", `attachment; filename="${pdf.fileName}"`);
  response.send(Buffer.from(pdf.buffer));
});

export const updatePaperQuestion: RequestHandler = asyncHandler(async (request, response) => {
  const assignmentId = readStringParam(request.params.id, "assignment id");
  const questionId = readStringParam(request.params.questionId, "question id");
  const input = updatePaperQuestionSchema.parse(request.body);
  const assignment = await assignmentService.updatePaperQuestion(
    assignmentId,
    questionId,
    input,
    request.auth?.clerkId,
    request.auth?.role
  );

  sendSuccess(response, {
    message: "Question updated successfully",
    data: assignment
  });
});

export const deletePaperQuestion: RequestHandler = asyncHandler(async (request, response) => {
  const assignmentId = readStringParam(request.params.id, "assignment id");
  const questionId = readStringParam(request.params.questionId, "question id");
  const assignment = await assignmentService.deletePaperQuestion(
    assignmentId,
    questionId,
    request.auth?.clerkId,
    request.auth?.role
  );

  sendSuccess(response, {
    message: "Question deleted successfully",
    data: assignment
  });
});

export const addPaperQuestion: RequestHandler = asyncHandler(async (request, response) => {
  const assignmentId = readStringParam(request.params.id, "assignment id");
  const input = paperQuestionSchema.parse(request.body);
  const assignment = await assignmentService.addPaperQuestion(
    assignmentId,
    input,
    request.auth?.clerkId,
    request.auth?.role
  );

  sendSuccess(response, {
    statusCode: 201,
    message: "Question added successfully",
    data: assignment
  });
});

export const regeneratePaperQuestion: RequestHandler = asyncHandler(async (request, response) => {
  const assignmentId = readStringParam(request.params.id, "assignment id");
  const questionId = readStringParam(request.params.questionId, "question id");
  const assignment = await assignmentService.regeneratePaperQuestion(
    assignmentId,
    questionId,
    request.auth?.clerkId,
    request.auth?.role
  );

  sendSuccess(response, {
    message: "Question regenerated successfully",
    data: assignment
  });
});

export const improvePaperQuestion: RequestHandler = asyncHandler(async (request, response) => {
  const assignmentId = readStringParam(request.params.id, "assignment id");
  const questionId = readStringParam(request.params.questionId, "question id");
  const input = improveQuestionSchema.parse(request.body);
  const assignment = await assignmentService.improvePaperQuestion(
    assignmentId,
    questionId,
    input.action,
    request.auth?.clerkId,
    request.auth?.role
  );

  sendSuccess(response, {
    message: "Question improved successfully",
    data: assignment
  });
});

export const restorePaperVersion: RequestHandler = asyncHandler(async (request, response) => {
  const assignmentId = readStringParam(request.params.id, "assignment id");
  const input = restorePaperVersionSchema.parse(request.body);
  const assignment = await assignmentService.restorePaperVersion(
    assignmentId,
    input.versionIndex,
    request.auth?.clerkId,
    request.auth?.role
  );

  sendSuccess(response, {
    message: "Paper version restored successfully",
    data: assignment
  });
});
