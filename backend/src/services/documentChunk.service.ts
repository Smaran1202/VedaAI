import { isDatabaseConnected } from "../config/database";
import { DocumentChunkModel } from "../models/documentChunk.model";

export interface RetrievedChunk {
  id: string;
  text: string;
  score: number;
}

interface RetrievalAssignment {
  subject: string;
  chapter?: string;
  instructions?: string;
  title?: string;
  extractedContent?: string;
}

const inMemoryChunks = new Map<string, RetrievedChunk[]>();

export async function replaceAssignmentChunks(assignmentId: string, extractedContent?: string) {
  const chunks = splitIntoChunks(extractedContent ?? "").map((text, index) => ({
    assignmentId,
    chunkIndex: index,
    text,
    tokenHint: Math.ceil(text.length / 4)
  }));

  if (!isDatabaseConnected()) {
    inMemoryChunks.set(
      assignmentId,
      chunks.map((chunk) => ({
        id: `${assignmentId}:chunk:${chunk.chunkIndex}`,
        text: chunk.text,
        score: 0
      }))
    );
    return chunks.length;
  }

  await DocumentChunkModel.deleteMany({ assignmentId });

  if (!chunks.length) {
    return 0;
  }

  await DocumentChunkModel.insertMany(chunks);
  return chunks.length;
}

export async function retrieveRelevantChunks(
  assignmentId: string,
  assignment: RetrievalAssignment,
  limit = 6
): Promise<RetrievedChunk[]> {
  const storedChunks = await loadChunks(assignmentId);
  const chunks = storedChunks.length
    ? storedChunks
    : splitIntoChunks(assignment.extractedContent ?? "").map((text, index) => ({
        id: `${assignmentId}:inline:${index}`,
        text,
        score: 0
      }));
  const queryTerms = tokenize(
    [assignment.subject, assignment.chapter, assignment.title, assignment.instructions]
      .filter(Boolean)
      .join(" ")
  );

  if (!chunks.length) {
    return [];
  }

  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk.text, queryTerms, assignment.subject)
    }))
    .sort((left, right) => right.score - left.score);

  const selected = scored.filter((chunk) => chunk.score > 0).slice(0, limit);
  const result = selected.length ? selected : scored.slice(0, Math.min(limit, scored.length));
  console.info("[assignment:rag:retrieve]", {
    assignmentId,
    subject: assignment.subject,
    chapter: assignment.chapter,
    instructions: assignment.instructions,
    storedChunks: storedChunks.length,
    selectedChunks: result.length
  });
  return result;
}

function splitIntoChunks(content: string) {
  const cleaned = content
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) {
    return [];
  }

  const paragraphs = cleaned.split(/\n{2,}/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;

    if (next.length > 1200 && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.flatMap((chunk) => {
    if (chunk.length <= 1600) {
      return [chunk];
    }

    const parts: string[] = [];
    for (let index = 0; index < chunk.length; index += 1200) {
      parts.push(chunk.slice(index, index + 1400));
    }
    return parts;
  });
}

async function loadChunks(assignmentId: string): Promise<RetrievedChunk[]> {
  if (!isDatabaseConnected()) {
    return inMemoryChunks.get(assignmentId) ?? [];
  }

  const chunks = await DocumentChunkModel.find({ assignmentId })
    .sort({ chunkIndex: 1 })
    .lean();

  return chunks.map((chunk) => ({
    id: String(chunk._id),
    text: chunk.text,
    score: 0
  }));
}

function scoreChunk(text: string, queryTerms: string[], subject: string) {
  const chunkTerms = new Set(tokenize(text));
  const subjectTerms = subjectFamilyTerms(subject);
  let score = 0;

  for (const term of queryTerms) {
    if (chunkTerms.has(term)) {
      score += subjectTerms.has(term) ? 5 : 2;
    }
  }

  for (const term of subjectTerms) {
    if (chunkTerms.has(term)) {
      score += 3;
    }
  }

  return score;
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

function subjectFamilyTerms(subject: string) {
  const value = subject.toLowerCase();
  const terms = new Set(tokenize(subject));

  if (value.includes("social") || value.includes("history") || value.includes("civics") || value.includes("geography")) {
    ["social", "history", "civics", "geography", "political", "democracy", "constitution", "empire", "revolution", "map", "culture"].forEach((term) => terms.add(term));
  }

  if (value.includes("science")) {
    ["science", "physics", "chemistry", "biology", "experiment", "organism", "energy", "matter"].forEach((term) => terms.add(term));
  }

  return terms;
}

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "class",
  "chapter",
  "question",
  "paper",
  "assignment"
]);
