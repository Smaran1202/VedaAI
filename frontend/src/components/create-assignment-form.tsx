"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DueDatePicker } from "@/components/due-date-picker";
import { QuestionTypeRow } from "@/components/question-type-row";
import { UploadBox } from "@/components/upload-box";
import { assignmentFormSchema, type AssignmentFormValues } from "@/lib/schemas";
import { useAssignmentFormStore } from "@/store/assignment-form-store";
import { useAssignmentStore } from "@/store/assignment-store";

export function CreateAssignmentForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const { values, setField, addQuestionType, updateQuestionType, removeQuestionType, totals } =
    useAssignmentFormStore();
  const createAssignment = useAssignmentStore((state) => state.createAssignment);
  const apiError = useAssignmentStore((state) => state.error);
  const isSaving = useAssignmentStore((state) => state.isFetching);
  const summary = totals();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    mode: "onBlur",
    values
  });

  const watched = watch();

  useEffect(() => {
    setField("title", watched.title);
    setField("subject", watched.subject);
    setField("classSection", watched.classSection);
    setField("dueDate", watched.dueDate);
    setField("timeAllowed", watched.timeAllowed);
    setField("instructions", watched.instructions ?? "");
  }, [
    watched.title,
    watched.subject,
    watched.classSection,
    watched.dueDate,
    watched.timeAllowed,
    watched.instructions,
    setField
  ]);

  const onSubmit = async (formValues: AssignmentFormValues) => {
    const id = await createAssignment({
      title: formValues.title,
      subject: formValues.subject,
      className: formValues.classSection,
      dueDate: normalizeDate(formValues.dueDate),
      timeAllowed: formValues.timeAllowed,
      questionTypes: formValues.questionTypes.map((row) => ({
        type: row.type,
        count: row.count,
        marks: row.marks
      })),
      totalQuestions: summary.questions,
      totalMarks: summary.marks,
      difficulty: "medium",
      instructions: formValues.instructions ?? "",
      sourceFile: formValues.sourceFile instanceof File ? formValues.sourceFile : undefined
    });

    router.push(`/assignments/${id}`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => setSubmitted(true))}
      className="mx-auto w-full max-w-[720px]"
    >
      <div className="mb-5 h-1.5 overflow-hidden rounded-full border border-line bg-white">
        <div className="h-full w-2/3 rounded-full bg-ink" />
      </div>

      <div className="surface p-4 md:p-6">
        <div>
          <h2 className="text-lg font-black tracking-tight">Assignment Details</h2>
          <p className="mt-1 text-sm text-neutral-500">Basic information about your assignment.</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="md:col-span-1">
            <span className="mb-1 block text-xs font-bold text-neutral-500">Assignment Name</span>
            <input className="control" {...register("title")} />
            {errors.title ? <span className="mt-1 block text-xs text-ember">{errors.title.message}</span> : null}
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-neutral-500">Subject</span>
            <input className="control" {...register("subject")} />
            {errors.subject ? <span className="mt-1 block text-xs text-ember">{errors.subject.message}</span> : null}
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-neutral-500">Class</span>
            <input className="control" {...register("classSection")} />
            {errors.classSection ? <span className="mt-1 block text-xs text-ember">{errors.classSection.message}</span> : null}
          </label>
        </div>

        <div className="mt-5">
          <Controller
            control={control}
            name="sourceFile"
            render={({ field }) => (
              <UploadBox
                file={field.value instanceof File ? field.value : undefined}
                onFileSelect={(file) => {
                  field.onChange(file);
                  setField("sourceFile", file);
                }}
              />
            )}
          />
          <p className="mt-2 text-xs font-medium text-neutral-500">Upload images of your preferred document/image</p>
        </div>

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

        <div className="mt-6 space-y-3">
          {values.questionTypes.map((row) => (
            <QuestionTypeRow
              key={row.id}
              row={row}
              canRemove={values.questionTypes.length > 1}
              onChange={(patch) => updateQuestionType(row.id, patch)}
              onRemove={() => removeQuestionType(row.id)}
            />
          ))}
          {submitted && errors.questionTypes ? (
            <p className="text-xs text-ember">{errors.questionTypes.message}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={addQuestionType}
          className="btn-primary mt-4"
        >
          <Plus className="h-4 w-4" />
          Add Question Type
        </button>

        <div className="mt-5 flex flex-wrap justify-end gap-x-6 gap-y-2 rounded-xl bg-neutral-50 px-3 py-2.5 text-sm font-black">
          <p>Total Questions: {summary.questions}</p>
          <p>Total Marks: {summary.marks}</p>
        </div>

        <label className="mt-5 block">
          <span className="mb-1 block text-xs font-bold text-neutral-500">Additional Information</span>
          <textarea
            className="control min-h-28 resize-none py-3"
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            {...register("instructions")}
          />
          {errors.instructions ? <span className="mt-1 block text-xs text-ember">{errors.instructions.message}</span> : null}
        </label>

        {apiError ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{apiError}</p> : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => router.push("/assignments")} className="btn-secondary px-6">
          Previous
        </button>
        <button
          type="submit"
          disabled={isSaving}
          title={isSaving ? "Saving assignment" : undefined}
          className="btn-primary px-8 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  );
}

function normalizeDate(date: string) {
  const parts = date.split("-");

  if (parts.length === 3 && parts[0].length === 2) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  return date;
}
