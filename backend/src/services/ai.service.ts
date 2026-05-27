import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { generateFallbackPaper } from "./fallbackPaper.service";
import { parseAIResponse } from "../utils/parseAIResponse";
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
  extractedContent?: string;
  className?: string;
  classSection?: string;
}

export async function generateQuestionPaper(assignment: AssignmentLike): Promise<GeneratedPaper> {
  if (!env.geminiApiKey) {
    console.info("Fallback used");
    return generateFallbackPaper(assignment);
  }

  try {
    console.info("Generating with Gemini...");
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildPrompt(assignment);
    console.log(`Gemini prompt length: ${prompt.length}`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.info("Gemini response received");
    return parseAIResponse(text, assignment);
  } catch {
    console.info("Fallback used");
    return generateFallbackPaper(assignment);
  }
}

function buildPrompt(assignment: AssignmentLike) {
  const questionTypes = assignment.questionTypes
    .map((item) => `- ${item.type}: ${item.count} questions, ${item.marks} marks each`)
    .join("\n");
  const uploadedContent = assignment.extractedContent?.trim();

  if (uploadedContent) {
    return buildUploadedContentPrompt(assignment, questionTypes, uploadedContent);
  }

  return `
You are an expert school assessment designer.

Return ONLY valid JSON. No markdown. No code fences. No explanation outside JSON.

Generate a question paper using this assignment:
School: Delhi Public School, Sector-4, Bokaro
Title: ${assignment.title}
Subject: ${assignment.subject}
Class: ${assignment.className ?? assignment.classSection ?? "5th"}
Due date: ${assignment.dueDate}
Difficulty: ${assignment.difficulty}
Total questions: ${assignment.totalQuestions}
Total marks: ${assignment.totalMarks}
Additional instructions: ${assignment.instructions || "None"}
Time allowed: ${assignment.timeAllowed || "45 minutes"}

Question type requirements:
${questionTypes}

Rules:
- Generate subject-specific, grade-appropriate educational content.
- Use chapter/topic clues from the title and additional instructions.
- If no topic is supplied, choose age-appropriate topics for the subject and class.
- For Science Grade 5, suitable topics include human body, plants, food and nutrition, materials, water, and simple machines.
- For Science Class 10, suitable topics include chemical reactions, electricity, life processes, light, acids and bases, heredity, and magnetic effects of electric current.
- For Math Grade 5, suitable topics include fractions, decimals, geometry, measurement, perimeter, area, and word problems.
- For English Grade 5, suitable topics include grammar, vocabulary, reading comprehension, sentence formation, and short writing.
- Question difficulty must match the selected class. Class 10 questions should require application, reasoning, equations, labelled diagrams, or conceptual comparison where appropriate.
- Generate exactly the requested number of questions for each question type.
- Use the exact marks requested for each question type.
- Group questions into sections by question type.
- Include difficulty for every question and mix easy, medium, and hard across the paper.
- Include marks for every question.
- For MCQs, include four meaningful options in an "options" array.
- MCQ options must be prefixed exactly as "A. ...", "B. ...", "C. ...", and "D. ...".
- MCQ answer keys must identify the correct prefixed option and answer text.
- Use diagram questions only when relevant to the subject/topic, and each diagram prompt must ask for a different labelled diagram or ray/circuit/biological structure.
- Use numerical questions only for subjects/topics where numerical reasoning is appropriate. Numerical questions must include subject-specific values and a solvable calculation, not generic counting examples.
- Include answer key that directly matches every generated question in order.
- Avoid duplicate questions. No two question strings may be the same or ask the same concept in the same way.
- If a requested question type is not relevant to the subject, adapt it to the closest relevant format while preserving the count and marks.
- Match subject and class level.
- Follow additional instructions.
- Return strictly parseable JSON.

Required JSON shape:
{
  "school": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${assignment.subject}",
  "className": "${assignment.className ?? assignment.classSection ?? "5th"}",
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

function buildUploadedContentPrompt(
  assignment: AssignmentLike,
  questionTypes: string,
  uploadedContent: string
) {
  return `
You are an expert school assessment designer.

Return ONLY valid JSON. No markdown. No code fences. No explanation outside JSON.

Generate questions from ONLY this extracted content:

${uploadedContent}

Class: ${assignment.className ?? assignment.classSection ?? "5th"}
Subject: ${assignment.subject}
Difficulty: ${assignment.difficulty}
Title: ${assignment.title}
Time allowed: ${assignment.timeAllowed || "45 minutes"}
Total questions: ${assignment.totalQuestions}
Total marks: ${assignment.totalMarks}
Additional instructions: ${assignment.instructions || "None"}

Question types:
${questionTypes}

Rules:
- Generate questions only from the extracted content above.
- Do not invent unrelated topics.
- Do not use generic subject knowledge unless the extracted content explicitly supports it.
- If a requested diagram or numerical question is not supported by the content, adapt it to a content-based question while preserving count and marks.
- Keep every question unique.
- Keep every diagram prompt unique.
- Keep every numerical question unique.
- Include difficulty for every question and use easy, medium, and hard where appropriate.
- Include marks for every question.
- For MCQs, include four options prefixed exactly as "A. ...", "B. ...", "C. ...", and "D. ...".
- Answer keys must match the generated questions in order.
- Return strictly parseable JSON.

Required JSON shape:
{
  "school": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${assignment.subject}",
  "className": "${assignment.className ?? assignment.classSection ?? "5th"}",
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
          "marks": 2
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
