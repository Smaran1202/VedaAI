import { generateFallbackPaper } from "../services/fallbackPaper.service";
import { normalizeGeneratedPaper } from "./normalizeGeneratedPaper";
import type { GeneratedPaper } from "../types/generated-paper.types";
import type { CreateAssignmentInput } from "../validators/assignment.validator";

interface AssignmentLike {
  title: string;
  subject: string;
  dueDate: Date | string;
  questionTypes: CreateAssignmentInput["questionTypes"];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  instructions?: string;
  timeAllowed?: string;
  className?: string;
  classSection?: string;
}

export function parseAIResponse(rawText: string, assignment: AssignmentLike): GeneratedPaper {
  try {
    const cleaned = stripMarkdownFences(rawText);
    const jsonText = extractJson(cleaned);
    const parsed = JSON.parse(jsonText) as unknown;

    if (isGeneratedPaper(parsed)) {
      return normalizeGeneratedPaper(parsed);
    }
  } catch {
    console.info("Fallback used");
    return generateFallbackPaper(assignment);
  }

  console.info("Fallback used");
  return generateFallbackPaper(assignment);
}

function stripMarkdownFences(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function extractJson(value: string) {
  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in AI response.");
  }

  return value.slice(firstBrace, lastBrace + 1);
}

function isGeneratedPaper(value: unknown): value is GeneratedPaper {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GeneratedPaper>;

  return (
    typeof candidate.school === "string" &&
    typeof candidate.subject === "string" &&
    typeof candidate.className === "string" &&
    typeof candidate.timeAllowed === "string" &&
    typeof candidate.maximumMarks === "number" &&
    typeof candidate.instructions === "string" &&
    Array.isArray(candidate.sections) &&
    candidate.sections.every(isSection) &&
    Array.isArray(candidate.answerKey) &&
    candidate.answerKey.every(isAnswer)
  );
}

function isSection(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const section = value as GeneratedPaper["sections"][number];
  return (
    typeof section.title === "string" &&
    typeof section.instruction === "string" &&
    typeof section.questionType === "string" &&
    Array.isArray(section.questions) &&
    section.questions.every(isQuestion)
  );
}

function isQuestion(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const question = value as GeneratedPaper["sections"][number]["questions"][number];
  return (
    typeof question.question === "string" &&
    typeof question.difficulty === "string" &&
    typeof question.marks === "number" &&
    (question.options === undefined ||
      (Array.isArray(question.options) &&
        question.options.every((option) => typeof option === "string")))
  );
}

function isAnswer(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const answer = value as GeneratedPaper["answerKey"][number];
  return typeof answer.questionNumber === "number" && typeof answer.answer === "string";
}
