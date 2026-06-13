import { Schema, model } from "mongoose";
import type { UserRole } from "../types/auth.types";

const userRoles: UserRole[] = ["teacher", "student", "admin"];

export const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: userRoles, required: true, default: "teacher" },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const UserModel = model("User", userSchema);
