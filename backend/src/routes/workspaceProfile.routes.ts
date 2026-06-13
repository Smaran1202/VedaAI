import { Router } from "express";
import * as workspaceProfileController from "../controllers/workspaceProfile.controller";
import { requireAuth } from "../middleware/auth";

export const workspaceProfileRouter = Router();

workspaceProfileRouter
  .route("/profile")
  .get(requireAuth, workspaceProfileController.getWorkspaceProfile)
  .put(requireAuth, workspaceProfileController.updateWorkspaceProfile);
