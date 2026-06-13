import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middleware/auth";

export const userRouter = Router();

userRouter.get("/me", requireAuth, userController.getCurrentUser);
userRouter.get("/summary", requireAuth, requireRole(["admin"]), userController.getPlatformSummary);
userRouter.post("/onboarding", requireAuth, userController.completeOnboarding);
