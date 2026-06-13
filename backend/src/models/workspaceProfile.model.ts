import { Schema, model } from "mongoose";

export const workspaceProfileSchema = new Schema(
  {
    userId: { type: String, required: true, trim: true, unique: true, index: true },
    schoolName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    board: { type: String, trim: true, default: "" },
    academicYear: { type: String, trim: true, default: "" },
    defaultClass: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

export const WorkspaceProfileModel = model("WorkspaceProfile", workspaceProfileSchema);
