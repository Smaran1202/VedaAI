import { Schema, model } from "mongoose";
import { ASSIGNMENT_STATUS } from "../constants/assignment.constants";

const questionTypeSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

export const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    subject: { type: String, required: true, trim: true, index: true },
    className: { type: String, trim: true, default: "5th" },
    dueDate: { type: Date, required: true },
    timeAllowed: { type: String, trim: true, default: "45 minutes" },
    questionTypes: { type: [questionTypeSchema], required: true, default: [] },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    difficulty: { type: String, required: true, trim: true, default: "medium" },
    instructions: { type: String, trim: true, default: "" },
    fileUrl: { type: String, trim: true, default: "" },
    extractedContent: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUS),
      default: ASSIGNMENT_STATUS.QUEUED,
      index: true
    },
    generatedPaper: { type: Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

assignmentSchema.index({ title: "text", subject: "text" });

export const AssignmentModel = model("Assignment", assignmentSchema);
