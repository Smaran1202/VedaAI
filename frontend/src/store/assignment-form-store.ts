"use client";

import { create } from "zustand";
import type { AssignmentFormValues } from "@/lib/schemas";

type QuestionType = AssignmentFormValues["questionTypes"][number];

interface AssignmentFormStore {
  values: AssignmentFormValues;
  setField: <K extends keyof AssignmentFormValues>(key: K, value: AssignmentFormValues[K]) => void;
  addQuestionType: () => void;
  updateQuestionType: (id: string, patch: Partial<QuestionType>) => void;
  removeQuestionType: (id: string) => void;
  totals: () => { questions: number; marks: number };
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const defaultQuestion = (): QuestionType => ({
  id: createId(),
  type: "Multiple Choice Questions",
  count: 4,
  marks: 1
});

const defaultQuestionTypes = (): QuestionType[] => [
  { id: createId(), type: "Multiple Choice Questions", count: 4, marks: 1 },
  { id: createId(), type: "Short Questions", count: 3, marks: 2 },
  { id: createId(), type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { id: createId(), type: "Numerical Problems", count: 5, marks: 5 }
];

export const useAssignmentFormStore = create<AssignmentFormStore>((set, get) => ({
  values: {
    school: "",
    title: "",
    subject: "",
    classSection: "",
    chapter: "",
    dueDate: "",
    timeAllowed: "3 hours",
    difficulty: "medium",
    sourceFile: undefined,
    questionTypes: defaultQuestionTypes(),
    instructions: ""
  },
  setField: (key, value) =>
    set((state) => ({
      values: {
        ...state.values,
        [key]: value
      }
    })),
  addQuestionType: () =>
    set((state) => ({
      values: {
        ...state.values,
        questionTypes: [...state.values.questionTypes, defaultQuestion()]
      }
    })),
  updateQuestionType: (id, patch) =>
    set((state) => ({
      values: {
        ...state.values,
        questionTypes: state.values.questionTypes.map((row) =>
          row.id === id ? { ...row, ...patch } : row
        )
      }
    })),
  removeQuestionType: (id) =>
    set((state) => ({
      values: {
        ...state.values,
        questionTypes:
          state.values.questionTypes.length === 1
            ? state.values.questionTypes
            : state.values.questionTypes.filter((row) => row.id !== id)
      }
    })),
  totals: () => {
    const rows = get().values.questionTypes;
    return rows.reduce(
      (total, row) => ({
        questions: total.questions + row.count,
        marks: total.marks + row.count * row.marks
      }),
      { questions: 0, marks: 0 }
    );
  }
}));
