import type { InferSchemaType } from "mongoose";
import type { assignmentSchema } from "../models/assignment.model";

export type AssignmentDocument = InferSchemaType<typeof assignmentSchema>;
