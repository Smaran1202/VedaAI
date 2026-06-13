import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import * as assignmentController from "../controllers/assignment.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import { ApiError } from "../utils/apiError";
import { createAssignmentSchema } from "../validators/assignment.validator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    if (
      [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ].includes(file.mimetype)
    ) {
      callback(null, true);
      return;
    }

    callback(new Error("Only PDF, TXT, and DOCX uploads are supported."));
  }
});

export const assignmentRouter = Router();

assignmentRouter
  .route("/")
  .post(
    requireAuth,
    requireRole(["teacher", "admin"]),
    upload.single("file"),
    normalizeMultipartAssignmentBody,
    validateRequest(createAssignmentSchema),
    assignmentController.createAssignment
  )
  .get(requireAuth, requireRole(["teacher", "student", "admin"]), assignmentController.getAssignments);

assignmentRouter.post(
  "/:id/regenerate",
  requireAuth,
  requireRole(["teacher", "admin"]),
  assignmentController.regenerateAssignment
);
assignmentRouter.post(
  "/:id/questions",
  requireAuth,
  requireRole(["teacher", "admin"]),
  assignmentController.addPaperQuestion
);
assignmentRouter.patch(
  "/:id/questions/:questionId",
  requireAuth,
  requireRole(["teacher", "admin"]),
  assignmentController.updatePaperQuestion
);
assignmentRouter.delete(
  "/:id/questions/:questionId",
  requireAuth,
  requireRole(["teacher", "admin"]),
  assignmentController.deletePaperQuestion
);
assignmentRouter.post(
  "/:id/questions/:questionId/regenerate",
  requireAuth,
  requireRole(["teacher", "admin"]),
  assignmentController.regeneratePaperQuestion
);
assignmentRouter.post(
  "/:id/questions/:questionId/improve",
  requireAuth,
  requireRole(["teacher", "admin"]),
  assignmentController.improvePaperQuestion
);
assignmentRouter.post(
  "/:id/versions/restore",
  requireAuth,
  requireRole(["teacher", "admin"]),
  assignmentController.restorePaperVersion
);
assignmentRouter.get(
  "/:id/pdf",
  requireAuth,
  requireRole(["teacher", "student", "admin"]),
  assignmentController.downloadAssignmentPdf
);

assignmentRouter
  .route("/:id")
  .get(requireAuth, requireRole(["teacher", "student", "admin"]), assignmentController.getAssignmentById)
  .delete(requireAuth, requireRole(["teacher", "admin"]), assignmentController.deleteAssignment);

const jsonFields = new Set(["questionTypes"]);

function normalizeMultipartAssignmentBody(request: Request, _response: Response, next: NextFunction) {
  if (!request.is("multipart/form-data")) {
    next();
    return;
  }

  for (const field of jsonFields) {
    const value = request.body[field];

    if (typeof value !== "string") {
      continue;
    }

    try {
      request.body[field] = JSON.parse(value) as unknown;
    } catch {
      next(new ApiError(400, `Invalid JSON in ${field}`));
      return;
    }
  }

  next();
}
