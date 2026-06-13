import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { generateFallbackPaper } from "./fallbackPaper.service";
import { parseAIResponse } from "../utils/parseAIResponse";
import type { GeneratedPaper } from "../types/generated-paper.types";
import type { GeneratedPaperQuestion } from "../types/generated-paper.types";
import type { CreateAssignmentInput } from "../validators/assignment.validator";

export interface AssignmentLike {
  school?: string;
  title: string;
  subject: string;
  chapter?: string;
  dueDate: Date | string;
  questionTypes: CreateAssignmentInput["questionTypes"];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  instructions?: string;
  timeAllowed?: string;
  extractedContent?: string;
  retrievedChunks?: Array<{ id: string; text: string; score?: number }>;
  className?: string;
  classSection?: string;
}

export async function generateQuestionPaper(assignment: AssignmentLike): Promise<GeneratedPaper> {
  console.info("[assignment:ai:start]", {
    subject: assignment.subject,
    chapter: assignment.chapter,
    className: assignment.className || assignment.classSection,
    instructions: assignment.instructions
  });

  if (!env.geminiApiKey) {
    console.info("Fallback used");
    return attachFallbackSourceIds(generateFallbackPaper(assignment), assignment);
  }

  try {
    console.info("Generating with Gemini...");
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildPrompt(assignment);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.info("Gemini response received");
    const paper = parseAIResponse(text, assignment);
    return validateGroundedPaper(paper, assignment);
  } catch {
    console.info("Fallback used");
    return attachFallbackSourceIds(generateFallbackPaper(assignment), assignment);
  }
}

export async function generateSingleQuestion(input: {
  assignment: AssignmentLike;
  sectionTitle: string;
  questionType: string;
  marks: number;
  difficulty: string;
  existingQuestions: string[];
  currentQuestion?: GeneratedPaperQuestion;
  action?: string;
}): Promise<GeneratedPaperQuestion> {
  if (!env.geminiApiKey) {
    return fallbackSingleQuestion(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildSingleQuestionPrompt(input);
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(stripJsonFence(result.response.text())) as Partial<GeneratedPaperQuestion>;

    return normalizeSingleQuestion(parsed, input);
  } catch {
    return fallbackSingleQuestion(input);
  }
}

function buildPrompt(assignment: AssignmentLike) {
  const questionTypes = assignment.questionTypes
    .map((item) => `- ${item.type}: ${item.count} questions, ${item.marks} marks each`)
    .join("\n");
  const uploadedContent = assignment.extractedContent?.trim();
  const retrievedContext = buildRetrievedContext(assignment);

  if (uploadedContent) {
    return buildUploadedContentPrompt(assignment, questionTypes, retrievedContext || uploadedContent);
  }

  return `
You are an expert school assessment designer.

Return ONLY valid JSON. No markdown. No code fences. No explanation outside JSON.

Generate a question paper using this assignment:
School: ${assignment.school || "Your School"}
Title: ${assignment.title}
Subject: ${assignment.subject}
Class: ${assignment.className ?? assignment.classSection ?? "the selected class"}
Chapter: ${assignment.chapter || "Not specified"}
Due date: ${assignment.dueDate}
Difficulty: ${assignment.difficulty}
Total questions: ${assignment.totalQuestions}
Total marks: ${assignment.totalMarks}
Additional instructions: ${assignment.instructions || "None"}
Time allowed: ${assignment.timeAllowed || "45 minutes"}

Question type requirements:
${questionTypes}

Rules:
- Generate questions suitable for:
  Class: ${assignment.className ?? assignment.classSection ?? "the selected class"}
  Subject: ${assignment.subject}
  Chapter/Topic: ${assignment.chapter || assignment.title}
- Do not generate content for any other class level.
- Generate subject-specific, grade-appropriate educational content.
- Use chapter/topic clues from the chapter, title, and additional instructions.
- If no topic is supplied, choose age-appropriate topics for the selected subject and class.
- Social Science, History, Civics, and Geography assignments must stay in Social Science domains and must not generate Science, Biology, Chemistry, or Physics questions.
- Question difficulty and complexity must match the selected class exactly.
- Generate exactly the requested number of questions for each question type.
- Use the exact marks requested for each question type.
- Group questions into sections by question type.
- Include difficulty for every question and mix easy, medium, and hard across the paper.
- Include marks for every question.
- For MCQs, include four meaningful options in an "options" array.
- MCQ options must be prefixed exactly as "A. ...", "B. ...", "C. ...", and "D. ...".
- MCQ answer keys must identify the correct prefixed option and answer text.
- Use diagram questions only when relevant to the subject/topic, and each diagram prompt must ask for a different labelled diagram, flow chart, structure, map, table, or process.
- Use numerical questions only for subjects/topics where numerical reasoning is appropriate. Numerical questions must include subject-specific values and a solvable calculation, not generic counting examples.
- Include answer key that directly matches every generated question in order.
- Avoid duplicate questions. No two question strings may be the same or ask the same concept in the same way.
- If a requested question type is not relevant to the subject, adapt it to the closest relevant format while preserving the count and marks.
- Match subject and class level.
- Follow additional instructions.
- Return strictly parseable JSON.

Required JSON shape:
{
  "school": "${assignment.school || "Your School"}",
  "subject": "${assignment.subject}",
  "className": "${assignment.className ?? assignment.classSection ?? "the selected class"}",
  "timeAllowed": "${assignment.timeAllowed || "45 minutes"}",
  "maximumMarks": ${assignment.totalMarks},
  "instructions": "All questions are compulsory unless stated otherwise.",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries 2 marks.",
      "questionType": "Short Answer Questions",
      "questions": [
        {
          "question": "Which part of a plant absorbs water and minerals from the soil?",
          "options": ["A. Leaf", "B. Root", "C. Flower", "D. Stem"],
          "difficulty": "easy",
          "marks": 2
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionNumber": 1,
      "answer": "B. Root"
    }
  ]
}
`.trim();
}

function buildSingleQuestionPrompt(input: {
  assignment: AssignmentLike;
  sectionTitle: string;
  questionType: string;
  marks: number;
  difficulty: string;
  existingQuestions: string[];
  currentQuestion?: GeneratedPaperQuestion;
  action?: string;
}) {
  return `
You are improving one school exam question for VedaAI.

Return ONLY valid JSON. No markdown. No code fences.

Assignment:
School: ${input.assignment.school || "Your School"}
Subject: ${input.assignment.subject}
Class: ${input.assignment.className ?? input.assignment.classSection ?? "the selected class"}
Chapter: ${input.assignment.chapter || input.assignment.title}
Section: ${input.sectionTitle}
Question type: ${input.questionType}
Marks: ${input.marks}
Difficulty: ${input.difficulty}
Action: ${input.action || "regenerate"}
Current question: ${input.currentQuestion?.question || "None"}

Existing questions to avoid:
${input.existingQuestions.map((question) => `- ${question}`).join("\n")}

Rules:
- Generate exactly one question.
- Match subject, class level, marks, difficulty, and question type.
- Avoid duplicates and near-duplicates.
- For MCQ, include exactly four options prefixed A., B., C., D.
- Include a concise answer.
- HOTS means higher-order thinking and application.
- Numerical means include solvable values when the subject supports calculation.

JSON shape:
{
  "question": "Question text",
  "difficulty": "${input.difficulty}",
  "marks": ${input.marks},
  "type": "${input.questionType}",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "answer": "Correct answer"
}
`.trim();
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizeSingleQuestion(
  value: Partial<GeneratedPaperQuestion>,
  input: {
    questionType: string;
    marks: number;
    difficulty: string;
  }
): GeneratedPaperQuestion {
  const isMcq = input.questionType.toLowerCase().includes("multiple") || input.questionType.toLowerCase().includes("mcq");
  const options = Array.isArray(value.options)
    ? value.options.map((option) => String(option).trim()).filter(Boolean).slice(0, 4)
    : [];

  return {
    question: String(value.question || "Create a subject-specific question based on the selected chapter.").trim(),
    type: input.questionType,
    difficulty: normalizeQuestionDifficulty(String(value.difficulty || input.difficulty)),
    marks: Number(value.marks || input.marks),
    options: isMcq ? ensureMcqOptions(options) : options,
    answer: String(value.answer || "Answer should match the accepted textbook explanation.").trim()
  };
}

function normalizeQuestionDifficulty(value: string) {
  const normalized = value.toLowerCase();
  return ["easy", "medium", "hard"].includes(normalized) ? normalized : "medium";
}

function ensureMcqOptions(options: string[]) {
  const defaults = ["A. Correct answer", "B. Related option", "C. Common misconception", "D. Unrelated option"];
  return defaults.map((fallback, index) => {
    const option = options[index] || fallback;
    return /^[A-D]\.\s/.test(option) ? option : `${String.fromCharCode(65 + index)}. ${option}`;
  });
}

function fallbackSingleQuestion(input: {
  assignment: AssignmentLike;
  questionType: string;
  marks: number;
  difficulty: string;
  currentQuestion?: GeneratedPaperQuestion;
  action?: string;
}): GeneratedPaperQuestion {
  const chapter = input.assignment.chapter || input.assignment.title;
  const actionText: Record<string, string> = {
    "make-easier": "Recall and explain",
    "make-harder": "Analyze and justify",
    "improve-wording": "Clearly explain",
    "add-hots": "Apply your understanding to solve",
    "add-numerical": "Use suitable values to calculate"
  };
  const lead = actionText[input.action || ""] || "Explain";
  const isMcq = input.questionType.toLowerCase().includes("multiple") || input.questionType.toLowerCase().includes("mcq");

  return {
    question: `${lead} a ${input.assignment.subject} concept from ${chapter} for class ${input.assignment.className ?? input.assignment.classSection ?? "the selected class"}.`,
    type: input.questionType,
    difficulty: input.difficulty,
    marks: input.marks,
    options: isMcq
      ? [
          "A. Correct concept",
          "B. Related but incomplete concept",
          "C. Common misconception",
          "D. Unrelated concept"
        ]
      : [],
    answer: "Answer should match the accepted textbook explanation."
  };
}

function buildUploadedContentPrompt(
  assignment: AssignmentLike,
  questionTypes: string,
  uploadedContent: string
) {
  return `
You are an expert school assessment designer.

Return ONLY valid JSON. No markdown. No code fences. No explanation outside JSON.

Generate questions from ONLY this provided context. Do not generate unrelated questions.

${uploadedContent}

Class: ${assignment.className ?? assignment.classSection ?? "the selected class"}
Subject: ${assignment.subject}
School: ${assignment.school || "Your School"}
Chapter: ${assignment.chapter || "Uploaded content"}
Difficulty: ${assignment.difficulty}
Title: ${assignment.title}
Time allowed: ${assignment.timeAllowed || "45 minutes"}
Total questions: ${assignment.totalQuestions}
Total marks: ${assignment.totalMarks}
Additional instructions: ${assignment.instructions || "None"}

Question types:
${questionTypes}

Rules:
- Use ONLY the provided context. Do not generate unrelated questions.
- Generate questions suitable for:
  Class: ${assignment.className ?? assignment.classSection ?? "the selected class"}
  Subject: ${assignment.subject}
  Chapter/Topic: ${assignment.chapter || assignment.title}
- Do not generate content for any other class level.
- Adapt uploaded material to the selected class without assuming any default class.
- First read the context, identify the chapter topic, key concepts, historical events, people, definitions, and cause-effect relationships.
- Generate educational school-level assessment questions that test understanding of those concepts.
- Never create MCQs from isolated extracted words or random tokens.
- Never ask vague MCQs like "Which option best relates to Germany?"
- Every generated question must be directly supported by one of the provided source chunks.
- Every generated question must include "sourceChunkId" matching the chunk id used.
- Do not invent unrelated topics.
- Do not use generic subject knowledge unless the extracted content explicitly supports it.
- The subject is ${assignment.subject}. Social/History/Civics/Geography must never become Science questions.
- The chapter/topic is ${assignment.chapter || assignment.title}. Keep questions aligned to it when the context supports it.
- If a requested diagram or numerical question is not supported by the content, adapt it to a content-based question while preserving count and marks.
- Keep every question unique.
- Keep every diagram prompt unique.
- Keep every numerical question unique.
- Include difficulty for every question and use easy, medium, and hard where appropriate.
- Include marks for every question.
- For MCQs, include four options prefixed exactly as "A. ...", "B. ...", "C. ...", and "D. ...".
- MCQ options must be meaningful answer choices, not single random words from the context.
- History/Social Science questions must ask about causes, leaders, events, definitions, consequences, or comparisons when the uploaded context supports them.
- Include MCQs, Short Answers, Long Answers, and HOTS-style understanding questions whenever the requested question types allow it.
- Answer keys must match the generated questions in order.
- Return strictly parseable JSON.

Required JSON shape:
{
  "school": "${assignment.school || "Your School"}",
  "subject": "${assignment.subject}",
  "className": "${assignment.className ?? assignment.classSection ?? "the selected class"}",
  "timeAllowed": "${assignment.timeAllowed || "45 minutes"}",
  "maximumMarks": ${assignment.totalMarks},
  "instructions": "All questions are compulsory unless stated otherwise.",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries 2 marks.",
      "questionType": "Short Answer Questions",
      "questions": [
        {
          "question": "A question based only on the uploaded content.",
          "options": ["A. Content option", "B. Content option", "C. Content option", "D. Content option"],
          "difficulty": "easy",
          "marks": 2,
          "sourceChunkId": "chunk id from context"
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionNumber": 1,
      "answer": "Answer supported by the uploaded content."
    }
  ]
}
`.trim();
}

function buildRetrievedContext(assignment: AssignmentLike) {
  const chunks = assignment.retrievedChunks ?? [];

  if (!chunks.length) {
    return "";
  }

  return chunks
    .map((chunk) => `[${chunk.id}]\n${chunk.text}`)
    .join("\n\n---\n\n");
}

function validateGroundedPaper(paper: GeneratedPaper, assignment: AssignmentLike) {
  const hasDocument = Boolean(assignment.extractedContent?.trim());
  const sourceIds = new Set((assignment.retrievedChunks ?? []).map((chunk) => chunk.id));
  const validSourceIds = sourceIds.size > 0 ? sourceIds : null;
  const subject = assignment.subject.toLowerCase();
  const topic = `${assignment.chapter ?? ""} ${assignment.title}`.toLowerCase();
  const socialSubject =
    subject.includes("social") ||
    subject.includes("history") ||
    subject.includes("civics") ||
    subject.includes("geography");

  for (const section of paper.sections) {
    for (const question of section.questions) {
      const text = `${question.question} ${question.answer ?? ""}`.toLowerCase();

      if (!isEducationalQuestion(question)) {
        throw new Error("Generated question is too shallow or token-based.");
      }

      if (socialSubject && containsScienceDrift(text)) {
        throw new Error("Generated question drifted away from social science.");
      }

      if (isChemistrySubject(subject) && containsPhysicsElectricityDrift(text)) {
        throw new Error("Generated Chemistry question drifted into electricity or physics.");
      }

      if (hasDocument) {
        if (validSourceIds && (!question.sourceChunkId || !validSourceIds.has(question.sourceChunkId))) {
          question.sourceChunkId = validSourceIds.values().next().value;
        }

        if (!isSupportedByContext(text, assignment.retrievedChunks ?? [], topic, subject)) {
          throw new Error("Generated question was not grounded in uploaded material.");
        }
      }
    }
  }

  return paper;
}

function isEducationalQuestion(question: GeneratedPaperQuestion) {
  const words = question.question
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 8) {
    return false;
  }

  if (!question.options?.length) {
    return true;
  }

  const questionTerms = new Set(
    words.map((word) => word.toLowerCase()).filter((word) => word.length > 3)
  );
  const cleanedOptions = question.options.map((option) =>
    option.replace(/^[A-D]\.\s*/, "").trim()
  );

  if (cleanedOptions.length < 4) {
    return false;
  }

  const tokenLikeOptions = cleanedOptions.filter((option) => {
    const optionWords = option.split(/\s+/).filter(Boolean);
    const normalized = option.toLowerCase();
    return (
      optionWords.length <= 2 ||
      weakMcqOptions.has(normalized) ||
      (optionWords.length === 1 && questionTerms.has(normalized))
    );
  });

  if (tokenLikeOptions.length >= 3) {
    return false;
  }

  const optionSet = new Set(cleanedOptions.map((option) => option.toLowerCase()));
  return optionSet.size === cleanedOptions.length;
}

function attachFallbackSourceIds(paper: GeneratedPaper, assignment: AssignmentLike) {
  if (!assignment.extractedContent?.trim()) {
    return paper;
  }

  const sourceIds = (assignment.retrievedChunks ?? []).map((chunk) => chunk.id);
  const defaultSourceId = sourceIds[0] ?? "uploaded-material";
  let index = 0;

  return {
    ...paper,
    sections: paper.sections.map((section) => ({
      ...section,
      questions: section.questions.map((question) => {
        const sourceChunkId = sourceIds[index % sourceIds.length] ?? defaultSourceId;
        index += 1;
        return {
          ...question,
          sourceChunkId
        };
      })
    }))
  };
}

function containsScienceDrift(text: string) {
  return [
    "photosynthesis",
    "chemical reaction",
    "acid",
    "base",
    "electricity",
    "organism",
    "cell",
    "respiration",
    "magnet",
    "force",
    "plant",
    "digestive"
  ].some((term) => text.includes(term));
}

function isChemistrySubject(subject: string) {
  return subject.includes("chem");
}

function containsPhysicsElectricityDrift(text: string) {
  return [
    "voltage",
    "current",
    "resistance",
    "resistor",
    "circuit",
    "ohm",
    "ammeter",
    "voltmeter",
    "electricity",
    "potential difference"
  ].some((term) => text.includes(term));
}

function isSupportedByContext(
  text: string,
  chunks: Array<{ id: string; text: string }>,
  topic: string,
  subject: string
) {
  if (!chunks.length) {
    return true;
  }

  const context = chunks.map((chunk) => chunk.text.toLowerCase()).join(" ");
  const terms = [...tokenizeForValidation(text), ...tokenizeForValidation(topic), ...tokenizeForValidation(subject)];
  const meaningful = terms.filter((term) => term.length > 4);

  if (!meaningful.length) {
    return true;
  }

  const hits = meaningful.filter((term) => context.includes(term)).length;
  return hits >= Math.min(2, meaningful.length);
}

function tokenizeForValidation(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 3 && !validationStopWords.has(term));
}

const validationStopWords = new Set([
  "question",
  "answer",
  "explain",
  "describe",
  "class",
  "subject",
  "chapter",
  "marks",
  "from",
  "with",
  "that",
  "this"
]);

const weakMcqOptions = new Set([
  "under",
  "over",
  "development",
  "material",
  "chapter",
  "context",
  "option",
  "concept"
]);
