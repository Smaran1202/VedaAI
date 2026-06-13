"use client";

import { Wand2, Pencil, Trash2, Plus, History, RotateCcw, Save, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import * as assignmentService from "@/services/assignment.service";
import type { Assignment, GeneratedPaper, GeneratedQuestion, GeneratedSection } from "@/types";

type DraftQuestion = {
  question: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  options: string;
  answer: string;
};

const improveActions: Array<{ action: assignmentService.ImproveAction; label: string }> = [
  { action: "make-easier", label: "Make Easier" },
  { action: "make-harder", label: "Make Harder" },
  { action: "improve-wording", label: "Improve Wording" },
  { action: "add-hots", label: "Add HOTS Question" },
  { action: "add-numerical", label: "Add Numerical Question" }
];

export function QuestionPaperStudio({
  assignmentId,
  paper,
  versions = [],
  canEdit,
  uploadedMaterialSummary,
  onAssignmentUpdate
}: {
  assignmentId: string;
  paper: GeneratedPaper;
  versions?: Assignment["versions"];
  canEdit: boolean;
  uploadedMaterialSummary?: string;
  onAssignmentUpdate: (assignment: Assignment) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingSectionId, setAddingSectionId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftQuestion | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showVersions, setShowVersions] = useState(false);

  async function runAction(key: string, action: () => Promise<Assignment>, success: string) {
    setBusyKey(key);
    setToast(null);

    try {
      const assignment = await action();
      onAssignmentUpdate(assignment);
      setToast({ type: "success", message: success });
      setEditingId(null);
      setAddingSectionId(null);
      setDraft(null);
    } catch {
      setToast({ type: "error", message: "Action failed. Please try again." });
    } finally {
      setBusyKey(null);
    }
  }

  function beginEdit(section: GeneratedSection, question: GeneratedQuestion) {
    setEditingId(question.id ?? "");
    setAddingSectionId(null);
    setDraft(toDraft(section, question));
  }

  function beginAdd(section: GeneratedSection) {
    setAddingSectionId(section.id ?? section.title);
    setEditingId(null);
    setDraft({
      question: "",
      type: section.questionType,
      difficulty: "medium",
      marks: 1,
      options: "",
      answer: ""
    });
  }

  async function saveEdit(questionId: string) {
    if (!draft) {
      return;
    }

    await runAction(
      `edit-${questionId}`,
      () => assignmentService.updateQuestion(assignmentId, questionId, fromDraft(draft)),
      "Question updated."
    );
  }

  async function saveAdd(section: GeneratedSection) {
    if (!draft) {
      return;
    }

    await runAction(
      `add-${section.id}`,
      () =>
        assignmentService.addQuestion(assignmentId, {
          ...fromDraft(draft),
          sectionId: section.id
        }),
      "Question added."
    );
  }

  return (
    <article className="mx-auto w-full max-w-[980px] rounded-2xl border border-line bg-white p-4 text-neutral-950 shadow-card md:p-7">
      {toast ? (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <header className="border-b border-neutral-300 pb-5 text-center font-serif">
        <h2 className="text-xl font-bold leading-tight md:text-2xl">{paper.school}</h2>
        <p className="mt-3 text-sm font-semibold">Subject: {paper.subject}</p>
        <p className="mt-1 text-sm font-semibold">Class: {paper.className}</p>
      </header>

      <div className="flex flex-col gap-2 border-b border-neutral-300 py-3 text-sm font-bold sm:flex-row sm:justify-between">
        <p>Time Allowed: {paper.timeAllowed}</p>
        <p>Maximum Marks: {paper.maximumMarks}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold leading-6">Instruction: {paper.instructions}</p>
          {uploadedMaterialSummary?.trim() ? (
            <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-left">
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
                Generated from uploaded material
              </span>
              <p className="mt-2 text-xs leading-5 text-green-900">
                {summarizeMaterial(uploadedMaterialSummary)}
              </p>
            </div>
          ) : null}
        </div>
        <button type="button" onClick={() => setShowVersions((value) => !value)} className="btn-secondary shrink-0 text-xs">
          <History className="h-4 w-4" />
          View versions
        </button>
      </div>

      {showVersions ? (
        <VersionPanel
          versions={versions}
          busyKey={busyKey}
          onRestore={(versionIndex) =>
            void runAction(
              `restore-${versionIndex}`,
              () => assignmentService.restoreVersion(assignmentId, versionIndex),
              "Version restored."
            )
          }
        />
      ) : null}

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <p>Name: <span className="inline-block min-w-44 border-b border-neutral-500" /></p>
        <p>Roll Number: <span className="inline-block min-w-32 border-b border-neutral-500" /></p>
        <p className="sm:col-span-2">Class/Section: <span className="inline-block min-w-40 border-b border-neutral-500" /></p>
      </div>

      {paper.sections.map((section) => (
        <section key={section.id ?? section.title} className="mt-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-center font-serif text-lg font-bold sm:text-left">{section.title}</h3>
              <p className="mt-3 text-sm font-black">{section.questionType}</p>
              <p className="mt-1 text-sm text-neutral-600">{section.instruction}</p>
            </div>
            {canEdit ? (
              <button type="button" onClick={() => beginAdd(section)} className="btn-secondary text-xs">
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            ) : null}
          </div>

          {addingSectionId === (section.id ?? section.title) && draft ? (
            <QuestionEditor
              draft={draft}
              setDraft={setDraft}
              isBusy={busyKey === `add-${section.id}`}
              onCancel={() => {
                setAddingSectionId(null);
                setDraft(null);
              }}
              onSave={() => void saveAdd(section)}
            />
          ) : null}

          <ol className="mt-5 list-none space-y-4">
            {section.questions.map((question, index) => {
              const questionId = question.id ?? `${section.id}-${index}`;
              const isEditing = editingId === questionId;

              return (
                <li key={questionId} className="rounded-2xl border border-line p-3">
                  {isEditing && draft ? (
                    <QuestionEditor
                      draft={draft}
                      setDraft={setDraft}
                      isBusy={busyKey === `edit-${questionId}`}
                      onCancel={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                      onSave={() => void saveEdit(questionId)}
                    />
                  ) : (
                    <QuestionView
                      index={index}
                      question={question}
                      canEdit={canEdit}
                      busyKey={busyKey}
                      onEdit={() => beginEdit(section, question)}
                      onDelete={() => {
                        const confirmed = window.confirm("Delete this question?");

                        if (confirmed) {
                          void runAction(
                            `delete-${questionId}`,
                            () => assignmentService.deleteQuestion(assignmentId, questionId),
                            "Question deleted."
                          );
                        }
                      }}
                      onRegenerate={() =>
                        void runAction(
                          `regen-${questionId}`,
                          () => assignmentService.regenerateQuestion(assignmentId, questionId),
                          "Question regenerated."
                        )
                      }
                      onImprove={(action) =>
                        void runAction(
                          `${action}-${questionId}`,
                          () => assignmentService.improveQuestion(assignmentId, questionId, action),
                          "AI improvement applied."
                        )
                      }
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <p className="mt-8 border-t border-neutral-300 pt-5 text-center text-sm font-black">End of Question Paper.</p>

      <section className="mt-8 rounded-2xl border border-line bg-neutral-50 p-4">
        <h3 className="text-base font-black">Answer Key</h3>
        <ol className="mt-3 space-y-2 text-sm leading-6">
          {paper.answerKey.map((answer) => (
            <li key={answer.questionNumber}>
              <span className="font-black">{answer.questionNumber}.</span> {answer.answer}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

function QuestionView({
  index,
  question,
  canEdit,
  busyKey,
  onEdit,
  onDelete,
  onRegenerate,
  onImprove
}: {
  index: number;
  question: GeneratedQuestion;
  canEdit: boolean;
  busyKey: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onImprove: (action: assignmentService.ImproveAction) => void;
}) {
  const questionId = question.id ?? "";
  const disabled = Boolean(busyKey);

  return (
    <div className="grid gap-3 text-sm leading-6">
      <div className="grid gap-2 sm:grid-cols-[28px_1fr_auto]">
        <span className="font-black">{index + 1}.</span>
        <span>{question.question}</span>
        <div className="flex items-start gap-2">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-black">{question.marks}M</span>
        </div>
      </div>
      {question.sourceChunkId ? (
        <p className="text-xs font-semibold text-green-700 sm:ml-7">
          Source: {question.sourceChunkId}
        </p>
      ) : null}
      {question.options?.length ? (
        <ul className="grid gap-1 text-sm text-neutral-700 sm:ml-7 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => (
            <li key={`${questionId}-${optionIndex}`} className="rounded-xl border border-line bg-neutral-50 px-3 py-1.5">
              {formatOption(option, optionIndex)}
            </li>
          ))}
        </ul>
      ) : null}
      {canEdit ? (
        <div className="flex flex-wrap gap-2 sm:ml-7">
          <StudioButton disabled={disabled} onClick={onEdit} label="Edit" icon={<Pencil className="h-3.5 w-3.5" />} />
          <StudioButton disabled={disabled} onClick={onDelete} label={busyKey === `delete-${questionId}` ? "Deleting..." : "Delete"} icon={<Trash2 className="h-3.5 w-3.5" />} />
          <StudioButton disabled={disabled} onClick={onRegenerate} label={busyKey === `regen-${questionId}` ? "Regenerating..." : "Regenerate"} icon={<RotateCcw className="h-3.5 w-3.5" />} />
          {improveActions.map((item) => (
            <StudioButton
              key={item.action}
              disabled={disabled}
              onClick={() => onImprove(item.action)}
              label={busyKey === `${item.action}-${questionId}` ? "Working..." : item.label}
              icon={<Wand2 className="h-3.5 w-3.5" />}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function QuestionEditor({
  draft,
  setDraft,
  isBusy,
  onCancel,
  onSave
}: {
  draft: DraftQuestion;
  setDraft: (draft: DraftQuestion) => void;
  isBusy: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl bg-neutral-50 p-3">
      <label>
        <span className="mb-1 block text-xs font-bold text-neutral-500">Question</span>
        <textarea
          className="control min-h-24 resize-none py-3"
          value={draft.question}
          onChange={(event) => setDraft({ ...draft, question: event.target.value })}
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          <span className="mb-1 block text-xs font-bold text-neutral-500">Type</span>
          <input className="control" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-neutral-500">Difficulty</span>
          <select
            className="control"
            value={draft.difficulty}
            onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as DraftQuestion["difficulty"] })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-neutral-500">Marks</span>
          <input
            className="control"
            type="number"
            min={1}
            value={draft.marks}
            onChange={(event) => setDraft({ ...draft, marks: Number(event.target.value) })}
          />
        </label>
      </div>
      <label>
        <span className="mb-1 block text-xs font-bold text-neutral-500">Options for MCQ</span>
        <textarea
          className="control min-h-20 resize-none py-3"
          value={draft.options}
          placeholder="A. Option one&#10;B. Option two&#10;C. Option three&#10;D. Option four"
          onChange={(event) => setDraft({ ...draft, options: event.target.value })}
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-bold text-neutral-500">Answer Key</span>
        <input className="control" value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} />
      </label>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={isBusy} className="btn-secondary text-xs">
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button type="button" onClick={onSave} disabled={isBusy || !draft.question.trim() || !draft.answer.trim()} className="btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-60">
          <Save className="h-4 w-4" />
          {isBusy ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function VersionPanel({
  versions,
  busyKey,
  onRestore
}: {
  versions?: Assignment["versions"];
  busyKey: string | null;
  onRestore: (versionIndex: number) => void;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-line bg-neutral-50 p-4">
      <h3 className="text-sm font-black">Version History</h3>
      {!versions?.length ? (
        <p className="mt-2 text-sm text-neutral-500">No question edits have been saved yet.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {versions.map((version, index) => (
            <div key={`${version.timestamp}-${index}`} className="flex flex-col gap-2 rounded-xl border border-line bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black">{version.action}</p>
                <p className="text-xs text-neutral-500">{new Date(version.timestamp).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => onRestore(index)}
                disabled={Boolean(busyKey)}
                className="btn-secondary text-xs"
              >
                {busyKey === `restore-${index}` ? "Restoring..." : "Restore"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StudioButton({
  label,
  icon,
  disabled,
  onClick
}: {
  label: string;
  icon: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-black outline-none transition hover:bg-neutral-50 focus:ring-2 focus:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  );
}

function toDraft(section: GeneratedSection, question: GeneratedQuestion): DraftQuestion {
  return {
    question: question.question,
    type: question.type || section.questionType,
    difficulty: normalizeDifficulty(question.difficulty),
    marks: question.marks,
    options: question.options?.join("\n") ?? "",
    answer: question.answer ?? ""
  };
}

function fromDraft(draft: DraftQuestion): assignmentService.QuestionPayload {
  return {
    question: draft.question.trim(),
    type: draft.type.trim(),
    difficulty: draft.difficulty,
    marks: Math.max(1, Number(draft.marks) || 1),
    options: draft.options
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean),
    answer: draft.answer.trim()
  };
}

function normalizeDifficulty(value: string): DraftQuestion["difficulty"] {
  return value === "easy" || value === "medium" || value === "hard" ? value : "medium";
}

function formatOption(option: string, optionIndex: number) {
  return /^[A-D]\.\s/.test(option)
    ? option
    : `${String.fromCharCode(65 + optionIndex)}. ${option}`;
}

function summarizeMaterial(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length <= 220 ? cleaned : `${cleaned.slice(0, 217)}...`;
}
