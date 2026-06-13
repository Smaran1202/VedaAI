import { z } from "zod";

export const questionTypeSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Choose a question type"),
  count: z.number().int().min(1, "Add at least one question").max(50),
  marks: z.number().int().min(1, "Marks are required").max(20)
});

export const assignmentFormSchema = z.object({
  school: z.string().min(2, "School is required"),
  subject: z.string().min(2, "Subject is required"),
  classSection: z.string().min(1, "Class/section is required"),
  chapter: z.string().min(2, "Chapter is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((value) => isValidIsoDate(value), "Enter a valid date")
    .refine((value) => !isPastDate(value), "Due date cannot be in the past"),
  timeAllowed: z.string().min(1, "Time allowed is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  sourceFile: z.unknown().optional(),
  questionTypes: z.array(questionTypeSchema).min(1, "Add one question type"),
  instructions: z.string().max(600).optional()
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

function isValidIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime());
}

function isPastDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}
