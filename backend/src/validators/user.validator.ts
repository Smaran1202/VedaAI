import { z } from "zod";

export const userRoleSchema = z.enum(["teacher", "student", "admin"]);

export const onboardingSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  name: z.string().trim().min(1, "Name is required").max(120),
  role: userRoleSchema
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
