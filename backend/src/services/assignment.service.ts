import { randomUUID } from "crypto";
import type { FilterQuery, SortOrder } from "mongoose";
import { env } from "../config/env";
import { isDatabaseConnected } from "../config/database";
import { ASSIGNMENT_STATUS } from "../constants/assignment.constants";
import { AssignmentModel } from "../models/assignment.model";
import { enqueueAssignmentGeneration } from "../queue/generation.queue";
import { emitAssignmentEvent } from "../socket";
import type { AssignmentQueryInput, CreateAssignmentInput } from "../validators/assignment.validator";
import type { PaperQuestionInput, UpdatePaperQuestionInput } from "../validators/assignment.validator";
import { ApiError } from "../utils/apiError";
import { generateQuestionPaper, generateSingleQuestion, type AssignmentLike } from "./ai.service";
import { wait } from "../utils/timing";
import { normalizeGeneratedPaper } from "../utils/normalizeGeneratedPaper";
import type { GeneratedPaper, GeneratedPaperQuestion } from "../types/generated-paper.types";
import { replaceAssignmentChunks, retrieveRelevantChunks } from "./documentChunk.service";
import {
  createMemoryAssignment,
  deleteMemoryAssignment,
  getMemoryAssignmentById,
  getMemoryAssignments,
  updateMemoryAssignment
} from "../repositories/memoryAssignment.repository";
import type { UserRole } from "../types/auth.types";

export async function createAssignment(input: CreateAssignmentInput) {
  console.info("[assignment:service:create]", {
    subject: input.subject,
    chapter: input.chapter,
    className: input.className || input.classSection,
    instructions: input.instructions
  });

  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    const assignment = createMemoryAssignment(input);
    void replaceAssignmentChunks(assignment.id, input.extractedContent);
    void runInlineGeneration(assignment.id);
    return assignment;
  }

  const assignment = await AssignmentModel.create({
    ...input,
    status: ASSIGNMENT_STATUS.QUEUED
  });
  console.info("[assignment:mongodb:created]", {
    assignmentId: assignment.id,
    subject: assignment.subject,
    chapter: assignment.chapter,
    className: assignment.className,
    instructions: assignment.instructions
  });
  await replaceAssignmentChunks(assignment.id, input.extractedContent);
  const queued = await enqueueAssignmentGeneration(assignment.id);

  if (queued) {
    emitAssignmentEvent("assignment:queued", {
      assignmentId: assignment.id,
      status: ASSIGNMENT_STATUS.QUEUED,
      message: "Assignment generation queued"
    });
  } else {
    void runInlineGeneration(assignment.id);
  }

  return assignment;
}

async function runInlineGeneration(assignmentId: string) {
  emitAssignmentEvent("assignment:queued", {
    assignmentId,
    status: ASSIGNMENT_STATUS.QUEUED,
    message: "Assignment generation queued"
  });

  await wait(250);
  await markAssignmentProcessing(assignmentId);
  emitAssignmentEvent("assignment:processing", {
    assignmentId,
    status: ASSIGNMENT_STATUS.PROCESSING,
    message: "Generating assignment paper"
  });

  await wait(1200);
  const assignment = await getGenerationAssignmentById(assignmentId);
  const generatedPaper = await generateQuestionPaper(assignment);
  await completeAssignmentGeneration(assignmentId, generatedPaper);
  emitAssignmentEvent("assignment:completed", {
    assignmentId,
    status: ASSIGNMENT_STATUS.COMPLETED,
    message: "Assignment paper generated successfully"
  });
}

export async function getAssignments(query: AssignmentQueryInput, ownerId?: string, role?: UserRole) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return getMemoryAssignments(query);
  }

  const filter: FilterQuery<typeof AssignmentModel> = {};

  if (ownerId && role !== "admin") {
    filter.ownerId = ownerId;
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { subject: { $regex: query.search, $options: "i" } }
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, SortOrder> = {
    [query.sortBy]: query.sortOrder === "asc" ? 1 : -1
  };

  const [assignments, total] = await Promise.all([
    AssignmentModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    AssignmentModel.countDocuments(filter)
  ]);

  return {
    assignments,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}

export async function getAssignmentById(id: string, ownerId?: string, role?: UserRole) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return ensureAssignmentPaperIds(getMemoryAssignmentById(id));
  }

  const assignment = await AssignmentModel.findById(id).lean();

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  assertAssignmentAccess(assignment, ownerId, role);

  return ensureAssignmentPaperIds(assignment);
}

export async function getGenerationAssignmentById(id: string) {
  const assignment = await getAssignmentById(id, undefined, "admin");
  const retrievedChunks = await retrieveRelevantChunks(id, assignment);
  console.info("[assignment:generation:loaded]", {
    assignmentId: id,
    subject: assignment.subject,
    chapter: assignment.chapter,
    className: assignment.className,
    instructions: assignment.instructions,
    retrievedChunks: retrievedChunks.length
  });

  return {
    ...assignment,
    retrievedChunks
  };
}

export async function deleteAssignment(id: string, ownerId?: string, role?: UserRole) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return deleteMemoryAssignment(id);
  }

  const assignment = await AssignmentModel.findById(id).lean();

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  assertAssignmentAccess(assignment, ownerId, role);

  await AssignmentModel.findByIdAndDelete(id);

  return assignment;
}

export async function markAssignmentProcessing(id: string) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return updateMemoryAssignment(id, { status: ASSIGNMENT_STATUS.PROCESSING });
  }

  const assignment = await AssignmentModel.findByIdAndUpdate(
    id,
    { status: ASSIGNMENT_STATUS.PROCESSING },
    { new: true }
  );

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return assignment;
}

export async function completeAssignmentGeneration(id: string, generatedPaper: unknown) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return updateMemoryAssignment(id, {
      status: ASSIGNMENT_STATUS.COMPLETED,
      generatedPaper
    });
  }

  const assignment = await AssignmentModel.findByIdAndUpdate(
    id,
    {
      status: ASSIGNMENT_STATUS.COMPLETED,
      generatedPaper
    },
    { new: true }
  );

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return assignment;
}

export async function markAssignmentFailed(id: string) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    return updateMemoryAssignment(id, { status: ASSIGNMENT_STATUS.FAILED });
  }

  return AssignmentModel.findByIdAndUpdate(id, {
    status: ASSIGNMENT_STATUS.FAILED
  });
}

export async function regenerateAssignment(id: string, ownerId?: string, role?: UserRole) {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    updateMemoryAssignment(id, {
      status: ASSIGNMENT_STATUS.QUEUED,
      generatedPaper: null
    });
    void runInlineGeneration(id);
    return { id, status: ASSIGNMENT_STATUS.QUEUED };
  }

  const existing = await AssignmentModel.findById(id).lean();

  if (!existing) {
    throw new ApiError(404, "Assignment not found");
  }

  assertAssignmentAccess(existing, ownerId, role);

  const assignment = await AssignmentModel.findByIdAndUpdate(
    id,
    {
      status: ASSIGNMENT_STATUS.QUEUED,
      generatedPaper: null
    },
    { new: true }
  );

  const queued = await enqueueAssignmentGeneration(id);

  if (!queued) {
    void runInlineGeneration(id);
  } else {
    emitAssignmentEvent("assignment:queued", {
      assignmentId: id,
      status: ASSIGNMENT_STATUS.QUEUED,
      message: "Assignment regeneration queued"
    });
  }

  return { id, status: ASSIGNMENT_STATUS.QUEUED };
}

export async function updatePaperQuestion(
  assignmentId: string,
  questionId: string,
  patch: UpdatePaperQuestionInput,
  ownerId?: string,
  role?: UserRole
) {
  const assignment = await getMutableAssignment(assignmentId, ownerId, role);
  const paper = getEditablePaper(assignment.generatedPaper);
  const previousPaper = clonePaper(paper);
  const { question, section } = findQuestion(paper, questionId);

  Object.assign(question, {
    ...patch,
    id: question.id,
    sectionId: section.id,
    type: patch.type ?? question.type ?? section.questionType
  });

  if (patch.answer !== undefined) {
    question.answer = patch.answer;
  }

  rebuildAnswerKeyAndTotals(paper);
  return savePaperMutation(assignment, paper, previousPaper, "edit", questionId);
}

export async function deletePaperQuestion(
  assignmentId: string,
  questionId: string,
  ownerId?: string,
  role?: UserRole
) {
  const assignment = await getMutableAssignment(assignmentId, ownerId, role);
  const paper = getEditablePaper(assignment.generatedPaper);
  const previousPaper = clonePaper(paper);
  let removed = false;

  paper.sections = paper.sections
    .map((section) => {
      const questions = section.questions.filter((question) => {
        if (question.id === questionId) {
          removed = true;
          return false;
        }

        return true;
      });

      return { ...section, questions };
    })
    .filter((section) => section.questions.length > 0);

  if (!removed) {
    throw new ApiError(404, "Question not found");
  }

  rebuildAnswerKeyAndTotals(paper);
  return savePaperMutation(assignment, paper, previousPaper, "delete", questionId);
}

export async function addPaperQuestion(
  assignmentId: string,
  input: PaperQuestionInput,
  ownerId?: string,
  role?: UserRole
) {
  const assignment = await getMutableAssignment(assignmentId, ownerId, role);
  const paper = getEditablePaper(assignment.generatedPaper);
  const previousPaper = clonePaper(paper);
  const targetSection = findOrCreateSection(paper, input.sectionId, input.type);
  const questionId = `question_${randomUUID()}`;

  targetSection.questions.push({
    id: questionId,
    sectionId: targetSection.id,
    type: input.type,
    question: input.question,
    difficulty: input.difficulty,
    marks: input.marks,
    options: input.options,
    answer: input.answer
  });

  rebuildAnswerKeyAndTotals(paper);
  return savePaperMutation(assignment, paper, previousPaper, "add", questionId);
}

export async function regeneratePaperQuestion(
  assignmentId: string,
  questionId: string,
  ownerId?: string,
  role?: UserRole
) {
  return mutateQuestionWithAI(assignmentId, questionId, "regenerate", ownerId, role);
}

export async function improvePaperQuestion(
  assignmentId: string,
  questionId: string,
  action: string,
  ownerId?: string,
  role?: UserRole
) {
  return mutateQuestionWithAI(assignmentId, questionId, action, ownerId, role);
}

export async function restorePaperVersion(
  assignmentId: string,
  versionIndex: number,
  ownerId?: string,
  role?: UserRole
) {
  const assignment = await getMutableAssignment(assignmentId, ownerId, role);
  const versions = Array.isArray(assignment.versions) ? assignment.versions : [];
  const version = versions[versionIndex];

  if (!version?.generatedPaper) {
    throw new ApiError(404, "Version not found");
  }

  const currentPaper = getEditablePaper(assignment.generatedPaper);
  const restoredPaper = getEditablePaper(version.generatedPaper);
  rebuildAnswerKeyAndTotals(restoredPaper);

  return savePaperMutation(
    assignment,
    restoredPaper,
    currentPaper,
    "restore-version",
    version.questionId || ""
  );
}

async function mutateQuestionWithAI(
  assignmentId: string,
  questionId: string,
  action: string,
  ownerId?: string,
  role?: UserRole
) {
  const assignment = await getMutableAssignment(assignmentId, ownerId, role);
  const paper = getEditablePaper(assignment.generatedPaper);
  const previousPaper = clonePaper(paper);
  const { question, section } = findQuestion(paper, questionId);
  const existingQuestions = paper.sections.flatMap((item) =>
    item.questions.filter((candidate) => candidate.id !== questionId).map((candidate) => candidate.question)
  );
  const generated = await generateSingleQuestion({
    assignment,
    sectionTitle: section.title,
    questionType: action === "add-hots"
      ? "HOTS Question"
      : action === "add-numerical"
      ? "Numerical Problems"
      : question.type || section.questionType,
    marks: question.marks,
    difficulty: action === "make-easier" ? "easy" : action === "make-harder" ? "hard" : question.difficulty,
    existingQuestions,
    currentQuestion: question,
    action
  });

  Object.assign(question, {
    ...generated,
    id: question.id,
    sectionId: section.id,
    marks: question.marks,
    difficulty: action === "make-easier" ? "easy" : action === "make-harder" ? "hard" : question.difficulty,
    type: generated.type || question.type || section.questionType
  });

  rebuildAnswerKeyAndTotals(paper);
  return savePaperMutation(assignment, paper, previousPaper, action, questionId);
}

function assertAssignmentAccess(
  assignment: { ownerId?: string | null },
  ownerId?: string,
  role?: UserRole
) {
  if (role === "admin" || !assignment.ownerId) {
    return;
  }

  if (!ownerId || assignment.ownerId !== ownerId) {
    throw new ApiError(404, "Assignment not found");
  }
}

type MutableAssignment = AssignmentLike & {
  id?: string;
  _id?: unknown;
  ownerId?: string | null;
  generatedPaper?: unknown;
  versions?: Array<{
    timestamp: Date | string;
    action: string;
    questionId?: string;
    generatedPaper: unknown;
  }>;
  totalQuestions?: number;
  totalMarks?: number;
};

function ensureAssignmentPaperIds<T extends { generatedPaper?: unknown }>(assignment: T): T {
  if (!assignment.generatedPaper) {
    return assignment;
  }

  return {
    ...assignment,
    generatedPaper: getEditablePaper(assignment.generatedPaper)
  };
}

async function getMutableAssignment(id: string, ownerId?: string, role?: UserRole): Promise<MutableAssignment> {
  if (!isDatabaseConnected()) {
    ensureDevelopmentFallback();
    const assignment = getMemoryAssignmentById(id);
    assertAssignmentAccess(assignment, ownerId, role);
    return assignment;
  }

  const assignment = await AssignmentModel.findById(id).lean();

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  assertAssignmentAccess(assignment, ownerId, role);
  return assignment as MutableAssignment;
}

function getEditablePaper(value: unknown): GeneratedPaper {
  if (!value || typeof value !== "object") {
    throw new ApiError(409, "Generated paper is not ready yet");
  }

  return normalizeGeneratedPaper(clonePaper(value as GeneratedPaper));
}

function clonePaper<T>(paper: T): T {
  return JSON.parse(JSON.stringify(paper)) as T;
}

function findQuestion(paper: GeneratedPaper, questionId: string) {
  for (const section of paper.sections) {
    const question = section.questions.find((candidate) => candidate.id === questionId);

    if (question) {
      return { section, question };
    }
  }

  throw new ApiError(404, "Question not found");
}

function findOrCreateSection(paper: GeneratedPaper, sectionId: string | undefined, questionType: string) {
  const existing = sectionId
    ? paper.sections.find((section) => section.id === sectionId)
    : paper.sections.find((section) => section.questionType === questionType);

  if (existing) {
    return existing;
  }

  const nextLetter = String.fromCharCode(65 + paper.sections.length);
  const section = {
    id: `section_${randomUUID()}`,
    title: `Section ${nextLetter}`,
    instruction: `Attempt all questions. Each question carries the indicated marks.`,
    questionType,
    questions: [] as GeneratedPaperQuestion[]
  };

  paper.sections.push(section);
  return section;
}

function rebuildAnswerKeyAndTotals(paper: GeneratedPaper) {
  let questionNumber = 1;
  let totalMarks = 0;
  const answerKey: GeneratedPaper["answerKey"] = [];

  for (const section of paper.sections) {
    for (const question of section.questions) {
      question.sectionId = section.id;
      question.type = question.type || section.questionType;
      question.marks = Number(question.marks) || 1;
      totalMarks += question.marks;
      answerKey.push({
        questionNumber,
        answer: question.answer || "Answer should match the accepted textbook explanation."
      });
      questionNumber += 1;
    }
  }

  paper.maximumMarks = totalMarks;
  paper.answerKey = answerKey;
}

async function savePaperMutation(
  assignment: MutableAssignment,
  paper: GeneratedPaper,
  previousPaper: GeneratedPaper,
  action: string,
  questionId: string
) {
  const versions = [
    ...(Array.isArray(assignment.versions)
      ? assignment.versions.map((version) => ({
          ...version,
          timestamp: new Date(version.timestamp)
        }))
      : []),
    {
      timestamp: new Date(),
      action,
      questionId,
      generatedPaper: previousPaper
    }
  ];
  const totalQuestions = paper.sections.reduce((total, section) => total + section.questions.length, 0);
  const totalMarks = paper.maximumMarks;
  const id = String(assignment._id || assignment.id);

  if (!isDatabaseConnected()) {
    const updated = updateMemoryAssignment(id, {
      generatedPaper: paper,
      versions,
      totalQuestions,
      totalMarks
    });
    return ensureAssignmentPaperIds(updated);
  }

  const updated = await AssignmentModel.findByIdAndUpdate(
    id,
    {
      generatedPaper: paper,
      versions,
      totalQuestions,
      totalMarks
    },
    { new: true }
  ).lean();

  if (!updated) {
    throw new ApiError(404, "Assignment not found");
  }

  return ensureAssignmentPaperIds(updated);
}

function ensureDevelopmentFallback() {
  if (env.nodeEnv === "production") {
    throw new ApiError(503, "Database unavailable", [{ database: "disconnected" }]);
  }
}
