import puppeteer from "puppeteer";
import type { GeneratedPaper, GeneratedPaperQuestion } from "../types/generated-paper.types";
import { ApiError } from "../utils/apiError";
import { normalizeGeneratedPaper } from "../utils/normalizeGeneratedPaper";

interface AssignmentForPdf {
  id?: string;
  _id?: unknown;
  title: string;
  generatedPaper?: unknown;
}

export async function generateAssignmentPdf(assignment: AssignmentForPdf) {
  const paper = readGeneratedPaper(assignment.generatedPaper);

  if (!paper) {
    throw new ApiError(409, "Question paper is not generated yet");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setContent(renderExamPaperHtml(normalizeGeneratedPaper(paper)), {
      waitUntil: "load"
    });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "16mm",
        bottom: "18mm",
        left: "16mm"
      }
    });

    return {
      buffer,
      fileName: `${slugify(assignment.title || "assignment-paper")}.pdf`
    };
  } finally {
    await browser.close();
  }
}

function readGeneratedPaper(value: unknown): GeneratedPaper | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<GeneratedPaper>;

  if (
    typeof candidate.school === "string" &&
    typeof candidate.subject === "string" &&
    typeof candidate.className === "string" &&
    typeof candidate.timeAllowed === "string" &&
    typeof candidate.maximumMarks === "number" &&
    typeof candidate.instructions === "string" &&
    Array.isArray(candidate.sections) &&
    Array.isArray(candidate.answerKey)
  ) {
    return candidate as GeneratedPaper;
  }

  return null;
}

function renderExamPaperHtml(paper: GeneratedPaper) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(paper.subject)} Question Paper</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #111;
        background: #fff;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        line-height: 1.45;
      }
      .paper { width: 100%; }
      .header {
        text-align: center;
        border-bottom: 1px solid #222;
        padding-bottom: 14px;
      }
      h1 {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 22px;
        line-height: 1.2;
      }
      .subtitle {
        margin-top: 8px;
        font-weight: 700;
      }
      .meta {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid #555;
        padding: 10px 0;
        font-weight: 700;
      }
      .instructions {
        margin: 14px 0;
        font-weight: 700;
      }
      .student {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 24px;
        margin: 16px 0 20px;
      }
      .line {
        display: inline-block;
        min-width: 150px;
        border-bottom: 1px solid #333;
        height: 12px;
      }
      .section {
        margin-top: 24px;
        break-inside: avoid;
      }
      .section h2 {
        margin: 0;
        text-align: center;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 17px;
      }
      .question-type {
        margin: 14px 0 2px;
        font-weight: 800;
      }
      .section-instruction {
        margin: 0 0 12px;
        color: #444;
      }
      ol {
        margin: 0;
        padding-left: 22px;
      }
      li {
        margin-bottom: 12px;
        break-inside: avoid;
      }
      .question-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
      }
      .marks {
        white-space: nowrap;
        font-weight: 700;
      }
      .difficulty {
        display: inline-block;
        margin-left: 6px;
        padding: 1px 7px;
        border: 1px solid #bbb;
        border-radius: 999px;
        color: #555;
        font-size: 10px;
        text-transform: capitalize;
      }
      .options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px 14px;
        margin: 7px 0 0;
        padding: 0;
        list-style: none;
      }
      .ending {
        margin-top: 28px;
        padding-top: 12px;
        border-top: 1px solid #333;
        text-align: center;
        font-weight: 800;
      }
      .answer-key {
        margin-top: 24px;
        padding-top: 12px;
        border-top: 1px solid #777;
        break-before: auto;
      }
      .answer-key h2 {
        margin: 0 0 10px;
        font-size: 15px;
      }
    </style>
  </head>
  <body>
    <main class="paper">
      <header class="header">
        <h1>${escapeHtml(paper.school)}</h1>
        <div class="subtitle">Subject: ${escapeHtml(paper.subject)}</div>
        <div class="subtitle">Class: ${escapeHtml(paper.className)}</div>
      </header>
      <section class="meta">
        <div>Time Allowed: ${escapeHtml(paper.timeAllowed)}</div>
        <div>Maximum Marks: ${paper.maximumMarks}</div>
      </section>
      <p class="instructions">Instruction: ${escapeHtml(paper.instructions)}</p>
      <section class="student">
        <div>Name: <span class="line"></span></div>
        <div>Roll Number: <span class="line"></span></div>
        <div>Class/Section: <span class="line"></span></div>
      </section>
      ${paper.sections.map(renderSection).join("")}
      <p class="ending">End of Question Paper.</p>
      <section class="answer-key">
        <h2>Answer Key</h2>
        <ol>
          ${paper.answerKey
            .map((answer) => `<li>${escapeHtml(answer.answer)}</li>`)
            .join("")}
        </ol>
      </section>
    </main>
  </body>
</html>`;
}

function renderSection(section: GeneratedPaper["sections"][number]) {
  return `<section class="section">
    <h2>${escapeHtml(section.title)}</h2>
    <p class="question-type">${escapeHtml(section.questionType)}</p>
    <p class="section-instruction">${escapeHtml(section.instruction)}</p>
    <ol>
      ${section.questions.map(renderQuestion).join("")}
    </ol>
  </section>`;
}

function renderQuestion(question: GeneratedPaperQuestion, index: number) {
  return `<li>
    <div class="question-row">
      <div>
        ${escapeHtml(question.question)}
        <span class="difficulty">${escapeHtml(question.difficulty)}</span>
      </div>
      <div class="marks">${question.marks} marks</div>
    </div>
    ${question.options?.length ? renderOptions(question.options) : ""}
  </li>`;
}

function renderOptions(options: string[]) {
  return `<ul class="options">
    ${options
      .map((option, optionIndex) => `<li>${escapeHtml(formatOption(option, optionIndex))}</li>`)
      .join("")}
  </ul>`;
}

function formatOption(option: string, optionIndex: number) {
  return /^[A-D]\.\s/.test(option)
    ? option
    : `${String.fromCharCode(65 + optionIndex)}. ${option}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "assignment-paper";
}
