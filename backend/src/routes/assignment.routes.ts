import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import * as assignmentController from "../controllers/assignment.controller";
import { validateRequest } from "../middleware/validateRequest";
import { ApiError } from "../utils/apiError";
import { createAssignmentSchema } from "../validators/assignment.validator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    if (["application/pdf", "text/plain", "image/jpeg", "image/png"].includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Only PDF, TXT, JPEG, and PNG uploads are supported."));
  }
});

export const assignmentRouter = Router();

assignmentRouter
  .route("/")
  .post(
    upload.single("file"),
    normalizeMultipartAssignmentBody,
    validateRequest(createAssignmentSchema),
    assignmentController.createAssignment
  )
  .get(assignmentController.getAssignments);

assignmentRouter.post("/:id/regenerate", assignmentController.regenerateAssignment);
assignmentRouter.get("/:id/pdf", assignmentController.downloadAssignmentPdf);

assignmentRouter
  .route("/:id")
  .get(assignmentController.getAssignmentById)
  .delete(assignmentController.deleteAssignment);

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
