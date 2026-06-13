import { z } from "zod";

export const workspaceProfileSchema = z.object({
  schoolName: z.string().trim().min(1, "School name is required").max(120),
  city: z.string().trim().min(1, "City is required").max(80),
  board: z.string().trim().max(80).optional().default(""),
  academicYear: z.string().trim().max(40).optional().default(""),
  defaultClass: z.string().trim().max(40).optional().default("")
});

export type WorkspaceProfileInput = z.infer<typeof workspaceProfileSchema>;
