import { z } from "zod";
import {
  ASSIGNMENT_SORT_FIELDS,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT
} from "../constants/assignment.constants";

const positiveInteger = z.coerce.number().int().positive();

export const createAssignmentSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    subject: z.string().trim().min(1, "Subject is required").max(80),
    className: z.string().trim().max(40).optional().default("5th"),
    classSection: z.string().trim().max(40).optional(),
    dueDate: z.coerce.date({ required_error: "Due date is required" }).refine((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return value >= today;
    }, "Due date cannot be in the past"),
    timeAllowed: z.string().trim().min(1).max(40).optional().default("45 minutes"),
    questionTypes: z
      .array(
        z.object({
          type: z.string().trim().min(1, "Question type is required"),
          count: positiveInteger,
          marks: positiveInteger
        })
      )
      .min(1, "At least one question type is required"),
    totalQuestions: positiveInteger,
    totalMarks: positiveInteger,
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    instructions: z.string().trim().max(1000).optional().default(""),
    fileUrl: z.string().trim().max(300).optional().default(""),
    extractedContent: z.string().trim().max(14000).optional().default("")
  })
  .superRefine((value, context) => {
    const calculatedQuestions = value.questionTypes.reduce((total, item) => total + item.count, 0);
    const calculatedMarks = value.questionTypes.reduce((total, item) => total + item.count * item.marks, 0);

    if (value.totalQuestions !== calculatedQuestions) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalQuestions"],
        message: "Total questions must match question type counts"
      });
    }

    if (value.totalMarks !== calculatedMarks) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalMarks"],
        message: "Total marks must match question type marks"
      });
    }
  });

export const assignmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  search: z.string().trim().optional(),
  sortBy: z.enum(ASSIGNMENT_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type AssignmentQueryInput = z.infer<typeof assignmentQuerySchema>;
