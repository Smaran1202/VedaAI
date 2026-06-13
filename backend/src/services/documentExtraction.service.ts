import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { recognize } from "tesseract.js";
import { ApiError } from "../utils/apiError";

const MAX_CONTENT_LENGTH = 14000;

export async function extractUploadedContent(file: Express.Multer.File) {
  try {
    const rawText = await extractText(file);
    const cleaned = cleanExtractedText(rawText);

    if (!cleaned) {
      throw new Error("No readable text found.");
    }

    const content = summarizeIfTooLarge(cleaned);
    return content;
  } catch {
    throw new ApiError(422, "Could not read uploaded content");
  }
}

async function extractText(file: Express.Multer.File) {
  if (file.mimetype === "text/plain") {
    return readTextFile(file);
  }

  if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({ data: file.buffer });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    const result = await recognize(file.buffer, "eng");
    return result.data.text;
  }

  throw new Error("Unsupported file type.");
}

async function readTextFile(file: Express.Multer.File) {
  if (file.path) {
    return readFile(file.path, "utf8");
  }

  return file.buffer.toString("utf8");
}

function cleanExtractedText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function summarizeIfTooLarge(value: string) {
  if (value.length <= MAX_CONTENT_LENGTH) {
    return value;
  }

  const paragraphs = value.split(/\n{2,}/);
  const selected: string[] = [];
  let total = 0;

  for (const paragraph of paragraphs) {
    if (total + paragraph.length > MAX_CONTENT_LENGTH) {
      break;
    }

    selected.push(paragraph);
    total += paragraph.length;
  }

  return selected.length ? selected.join("\n\n") : value.slice(0, MAX_CONTENT_LENGTH);
}
