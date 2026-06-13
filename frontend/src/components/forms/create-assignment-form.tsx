"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, FileText, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { DueDatePicker } from "@/components/forms/due-date-picker";
import { QuestionTypeRow } from "@/components/forms/question-type-row";
import { UploadBox } from "@/components/forms/upload-box";
import { assignmentFormSchema, type AssignmentFormValues } from "@/lib/schemas";
import { useAssignmentFormStore } from "@/store/assignment-form-store";
import { useAssignmentStore } from "@/store/assignment-store";
import { useWorkspaceProfile } from "@/hooks/use-workspace-profile";

const steps = [
  "Basics",
  "Questions",
  "Upload",
  "Review",
  "Save"
] as const;

const stepFields: Record<number, Array<keyof AssignmentFormValues>> = {
  0: ["school", "classSection", "subject", "chapter", "dueDate", "timeAllowed"],
  1: ["difficulty", "questionTypes"],
  2: ["sourceFile"],
  3: ["school", "classSection", "subject", "chapter", "dueDate", "timeAllowed", "difficulty", "questionTypes"],
  4: []
};

export function CreateAssignmentForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const hasHydratedProfile = useRef(false);
  const { profile } = useWorkspaceProfile();
  const initialValues = useAssignmentFormStore((state) => state.values);
  const defaultValues = useMemo(() => initialValues, []);
  const createAssignment = useAssignmentStore((state) => state.createAssignment);
  const apiError = useAssignmentStore((state) => state.error);
  const isSaving = useAssignmentStore((state) => state.isFetching);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    getValues
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    mode: "onBlur",
    defaultValues
  });

  const watchedSubject = useWatch({ control, name: "subject" });
  const watchedChapter = useWatch({ control, name: "chapter" });
  const watchedClassSection = useWatch({ control, name: "classSection" });
  const watchedTitle = useWatch({ control, name: "title" });
  const watchedQuestionTypes = useWatch({ control, name: "questionTypes" }) ?? [];
  const summary = useMemo(() => calculateTotals(watchedQuestionTypes), [watchedQuestionTypes]);
  const assignmentTitle = useMemo(
    () => buildAssignmentTitle(watchedSubject, watchedChapter, watchedClassSection),
    [watchedSubject, watchedChapter, watchedClassSection]
  );

  useEffect(() => {
    if (assignmentTitle && watchedTitle !== assignmentTitle) {
      setValue("title", assignmentTitle, { shouldValidate: false });
    }
  }, [assignmentTitle, setValue, watchedTitle]);

  useEffect(() => {
    if (!profile || hasHydratedProfile.current) {
      return;
    }

    if (profile.schoolName) {
      setValue(
        "school",
        [profile.schoolName, profile.city, profile.board].filter(Boolean).join(", "),
        { shouldValidate: true }
      );
    }

    if (profile.defaultClass) {
      setValue("classSection", profile.defaultClass, { shouldValidate: true });
    }

    hasHydratedProfile.current = true;
  }, [profile, setValue]);

  function addQuestionType() {
    setValue(
      "questionTypes",
      [
        ...watchedQuestionTypes,
        {
          id: createId(),
          type: "Multiple Choice Questions",
          count: 1,
          marks: 1
        }
      ],
      { shouldDirty: true, shouldValidate: true }
    );
  }

  function updateQuestionType(id: string, patch: Partial<AssignmentFormValues["questionTypes"][number]>) {
    setValue(
      "questionTypes",
      watchedQuestionTypes.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  function removeQuestionType(id: string) {
    if (watchedQuestionTypes.length <= 1) {
      return;
    }

    setValue(
      "questionTypes",
      watchedQuestionTypes.filter((row) => row.id !== id),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  async function goNext() {
    const valid = await trigger(stepFields[step], { shouldFocus: true });

    if (!valid) {
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    if (step === 0) {
      router.push("/assignments");
      return;
    }

    setStep((current) => Math.max(current - 1, 0));
  }

  const onSubmit = async (formValues: AssignmentFormValues) => {
    const title = buildAssignmentTitle(
      formValues.subject,
      formValues.chapter,
      formValues.classSection
    );
    console.info("[assignment:frontend:submit]", {
      subject: formValues.subject,
      chapter: formValues.chapter,
      className: formValues.classSection,
      instructions: formValues.instructions
    });
    const id = await createAssignment({
      school: formValues.school,
      title,
      subject: formValues.subject,
      className: formValues.classSection,
      chapter: formValues.chapter,
      dueDate: normalizeDate(formValues.dueDate),
      timeAllowed: formValues.timeAllowed,
      questionTypes: formValues.questionTypes.map((row) => ({
        type: row.type,
        count: row.count,
        marks: row.marks
      })),
      totalQuestions: summary.questions,
      totalMarks: summary.marks,
      difficulty: formValues.difficulty,
      instructions: formValues.instructions ?? "",
      sourceFile: formValues.sourceFile instanceof File ? formValues.sourceFile : undefined
    });

    router.push(`/assignments/${id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-[860px]">
      <div className="mb-5 grid grid-cols-5 gap-2">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={async () => {
              if (index <= step) {
                setStep(index);
                return;
              }

              const valid = await trigger(stepFields[step], { shouldFocus: true });

              if (valid) {
                setStep(index);
              }
            }}
            className={`rounded-2xl border px-2 py-2 text-xs font-black outline-none transition focus:ring-2 focus:ring-ink/10 ${
              index === step
                ? "border-ink bg-ink text-white"
                : index < step
                ? "border-ink bg-white text-ink"
                : "border-line bg-white text-neutral-400"
            }`}
          >
            <span className="hidden sm:inline">{index + 1}. {label}</span>
            <span className="sm:hidden">{index + 1}</span>
          </button>
        ))}
      </div>

      <div className="surface p-4 md:p-6">
        {step === 0 ? (
          <StepBasics register={register} control={control} errors={errors} />
        ) : null}

        {step === 1 ? (
          <StepQuestions
            register={register}
            rows={watchedQuestionTypes}
            summary={summary}
            errors={errors}
            addQuestionType={addQuestionType}
            updateQuestionType={updateQuestionType}
            removeQuestionType={removeQuestionType}
          />
        ) : null}

        {step === 2 ? (
          <StepUpload control={control} />
        ) : null}

        {step === 3 ? (
          <StepReview values={getValues()} summary={summary} />
        ) : null}

        {step === 4 ? (
          <StepSave isSaving={isSaving} error={apiError} />
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={goBack} className="btn-secondary px-6">
          <ArrowLeft className="h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </button>

        {step < steps.length - 1 ? (
          <button type="button" onClick={() => void goNext()} className="btn-primary px-8">
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSaving}
            title={isSaving ? "Saving assignment" : undefined}
            className="btn-primary px-8 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Assignment"}
            <Save className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function StepBasics({
  register,
  control,
  errors
}: {
  register: ReturnType<typeof useForm<AssignmentFormValues>>["register"];
  control: ReturnType<typeof useForm<AssignmentFormValues>>["control"];
  errors: ReturnType<typeof useForm<AssignmentFormValues>>["formState"]["errors"];
}) {
  return (
    <div>
      <StepHeader
        title="Assignment basics"
        description="Set the school, class, subject, chapter, duration, and due date."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field label="School" error={errors.school?.message}>
          <input className="control" {...register("school")} />
        </Field>
        <Field label="Class" error={errors.classSection?.message}>
          <input className="control" {...register("classSection")} />
        </Field>
        <Field label="Subject" error={errors.subject?.message}>
          <input className="control" {...register("subject")} />
        </Field>
        <Field label="Chapter" error={errors.chapter?.message}>
          <input className="control" {...register("chapter")} />
        </Field>
        <Field label="Duration" error={errors.timeAllowed?.message}>
          <input className="control" placeholder="e.g. 3 hours" {...register("timeAllowed")} />
        </Field>
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DueDatePicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.dueDate?.message}
            />
          )}
        />
      </div>
    </div>
  );
}

function StepQuestions({
  register,
  rows,
  summary,
  errors,
  addQuestionType,
  updateQuestionType,
  removeQuestionType
}: {
  register: ReturnType<typeof useForm<AssignmentFormValues>>["register"];
  rows: AssignmentFormValues["questionTypes"];
  summary: { questions: number; marks: number };
  errors: ReturnType<typeof useForm<AssignmentFormValues>>["formState"]["errors"];
  addQuestionType: () => void;
  updateQuestionType: (id: string, patch: Partial<AssignmentFormValues["questionTypes"][number]>) => void;
  removeQuestionType: (id: string) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Question plan"
        description="Choose difficulty, question types, counts, and marks distribution."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-[220px_1fr]">
        <Field label="Difficulty" error={errors.difficulty?.message}>
          <select className="control" {...register("difficulty")}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </Field>
        <div className="rounded-2xl border border-line bg-neutral-50 px-4 py-3 text-sm font-black">
          <p>Number of Questions: {summary.questions}</p>
          <p className="mt-1">Total Marks: {summary.marks}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <QuestionTypeRow
            key={row.id}
            row={row}
            canRemove={rows.length > 1}
            onChange={(patch) => updateQuestionType(row.id, patch)}
            onRemove={() => removeQuestionType(row.id)}
          />
        ))}
        {errors.questionTypes ? (
          <p className="text-xs text-ember">{errors.questionTypes.message}</p>
        ) : null}
      </div>

      <button type="button" onClick={addQuestionType} className="btn-primary mt-4">
        <Plus className="h-4 w-4" />
        Add Question Type
      </button>
    </div>
  );
}

function StepUpload({
  control
}: {
  control: ReturnType<typeof useForm<AssignmentFormValues>>["control"];
}) {
  return (
    <div>
      <StepHeader
        title="Upload source material"
        description="Attach a PDF, TXT, or DOCX file if the paper should be generated from source material."
      />
      <div className="mt-5">
        <Controller
          control={control}
          name="sourceFile"
          render={({ field }) => (
            <UploadBox
              file={field.value instanceof File ? field.value : undefined}
              onFileSelect={(file) => {
                field.onChange(file);
              }}
            />
          )}
        />
      </div>
    </div>
  );
}

function StepReview({
  values,
  summary
}: {
  values: AssignmentFormValues;
  summary: { questions: number; marks: number };
}) {
  const file = values.sourceFile instanceof File ? values.sourceFile.name : "No file uploaded";
  const items = [
    ["School", values.school],
    ["Class", values.classSection],
    ["Subject", values.subject],
    ["Chapter", values.chapter],
    ["Duration", values.timeAllowed],
    ["Due date", values.dueDate],
    ["Difficulty", values.difficulty],
    ["Questions", String(summary.questions)],
    ["Marks", String(summary.marks)],
    ["Upload", file]
  ];

  return (
    <div>
      <StepHeader
        title="Review assignment"
        description="Confirm the details before saving and starting generation."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">{label}</p>
            <p className="mt-1 text-sm font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-line bg-neutral-50 p-4">
        <p className="text-sm font-black">Question types</p>
        <div className="mt-3 grid gap-2">
          {values.questionTypes.map((row) => (
            <p key={row.id} className="flex items-center justify-between gap-3 text-sm text-neutral-600">
              <span>{row.type}</span>
              <span className="font-black text-ink">{row.count} x {row.marks}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSave({ isSaving, error }: { isSaving: boolean; error: string | null }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line bg-neutral-50">
        {isSaving ? <FileText className="h-5 w-5 animate-pulse" /> : <Check className="h-5 w-5" />}
      </div>
      <h2 className="mt-4 text-lg font-black">Save assignment</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        Saving creates the assignment in MongoDB with your Clerk user id and starts the generation flow.
      </p>
      {error ? <p className="mx-auto mt-4 max-w-md rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-neutral-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-ember">{error}</span> : null}
    </label>
  );
}

function buildAssignmentTitle(subject?: string, chapter?: string, classSection?: string) {
  const parts = [subject, chapter].filter(Boolean).join(" - ");
  return parts ? `${parts} (${classSection || "Class"})` : "";
}

function calculateTotals(rows: AssignmentFormValues["questionTypes"]) {
  return rows.reduce(
    (total, row) => ({
      questions: total.questions + row.count,
      marks: total.marks + row.count * row.marks
    }),
    { questions: 0, marks: 0 }
  );
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function normalizeDate(date: string) {
  const parts = date.split("-");

  if (parts.length === 3 && parts[0].length === 2) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  return date;
}
