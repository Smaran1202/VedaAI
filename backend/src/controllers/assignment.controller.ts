import type { RequestHandler } from "express";
import { assignmentQuerySchema, type CreateAssignmentInput } from "../validators/assignment.validator";
import * as assignmentService from "../services/assignment.service";
import { extractUploadedContent } from "../services/documentExtraction.service";
import { generateAssignmentPdf } from "../services/pdf.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { readStringParam } from "../utils/requestParams";

export const createAssignment: RequestHandler = asyncHandler(async (request, response) => {
  const fileUrl = request.file ? request.file.originalname : request.body.fileUrl;
  const extractedContent = request.file ? await extractUploadedContent(request.file) : "";
  const payload: CreateAssignmentInput = {
    ...request.body,
    fileUrl,
    extractedContent
  };
  const assignment = await assignmentService.createAssignment(payload);

  sendSuccess(response, {
    statusCode: 201,
    message: "Assignment created successfully",
    data: { id: assignment.id, status: assignment.status }
  });
});

export const getAssignments: RequestHandler = asyncHandler(async (request, response) => {
  const query = assignmentQuerySchema.parse(request.query);
  const result = await assignmentService.getAssignments(query);

  sendSuccess(response, {
    message: "Assignments fetched successfully",
    data: result.assignments,
    meta: result.meta
  });
});

export const getAssignmentById: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  const assignment = await assignmentService.getAssignmentById(id);

  sendSuccess(response, {
    message: "Assignment fetched successfully",
    data: assignment
  });
});

export const deleteAssignment: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  await assignmentService.deleteAssignment(id);

  sendSuccess(response, {
    message: "Assignment deleted successfully",
    data: { id }
  });
});

export const regenerateAssignment: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  const result = await assignmentService.regenerateAssignment(id);

  sendSuccess(response, {
    message: "Assignment regeneration queued successfully",
    data: result
  });
});

export const downloadAssignmentPdf: RequestHandler = asyncHandler(async (request, response) => {
  const id = readStringParam(request.params.id, "assignment id");
  const assignment = await assignmentService.getAssignmentById(id);
  const pdf = await generateAssignmentPdf(assignment);

  response.setHeader("Content-Type", "application/pdf");
  response.setHeader("Content-Disposition", `attachment; filename="${pdf.fileName}"`);
  response.send(Buffer.from(pdf.buffer));
});
