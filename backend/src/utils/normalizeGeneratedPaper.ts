import type { GeneratedPaper } from "../types/generated-paper.types";

const difficultyCycle = ["easy", "medium", "hard"] as const;

export function normalizeGeneratedPaper(paper: GeneratedPaper): GeneratedPaper {
  const seenQuestions = new Set<string>();
  const originalAnswers = new Map(
    paper.answerKey.map((answer) => [answer.questionNumber, answer.answer])
  );
  const answerKey: GeneratedPaper["answerKey"] = [];
  let originalQuestionNumber = 1;
  let normalizedQuestionNumber = 1;

  const sections = paper.sections
    .map((section, sectionIndex) => {
      const sectionId = section.id || createStableId("section", `${section.title}-${sectionIndex}`);
      const questions = section.questions.flatMap((question) => {
        const normalizedText = normalizeQuestionText(question.question);
        const originalAnswer = originalAnswers.get(originalQuestionNumber);
        const questionNumber = originalQuestionNumber;
        originalQuestionNumber += 1;

        if (!normalizedText || seenQuestions.has(normalizedText)) {
          return [];
        }

        seenQuestions.add(normalizedText);
        answerKey.push({
          questionNumber: normalizedQuestionNumber,
          answer: originalAnswer?.trim() || "Answer should match the accepted textbook explanation."
        });
        normalizedQuestionNumber += 1;

        return [
          {
            ...question,
            id: question.id || createStableId("question", `${sectionId}-${questionNumber}-${question.question}`),
            sectionId,
            type: question.type || section.questionType,
            question: question.question.trim(),
            difficulty: normalizeDifficulty(question.difficulty, normalizedQuestionNumber),
            options: question.options?.map((option) => option.trim()).filter(Boolean),
            answer: question.answer?.trim() || originalAnswer?.trim() || "Answer should match the accepted textbook explanation.",
            sourceChunkId: question.sourceChunkId
          }
        ];
      });

      return {
        ...section,
        id: sectionId,
        questions
      };
    })
    .filter((section) => section.questions.length > 0);

  return {
    ...paper,
    sections,
    answerKey
  };
}

function createStableId(prefix: string, value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return `${prefix}_${hash.toString(36)}`;
}

function normalizeQuestionText(question: string) {
  return question
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!]+$/g, "");
}

function normalizeDifficulty(difficulty: string, index: number) {
  const normalized = difficulty.trim().toLowerCase();

  if (difficultyCycle.includes(normalized as (typeof difficultyCycle)[number])) {
    return normalized;
  }

  return difficultyCycle[index % difficultyCycle.length];
}
