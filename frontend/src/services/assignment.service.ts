import { api } from "@/services/api";
import type { Assignment, GeneratedQuestion } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AssignmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "title" | "subject";
  sortOrder?: "asc" | "desc";
}

export interface CreateAssignmentPayload {
  school: string;
  title: string;
  subject: string;
  className?: string;
  chapter: string;
  dueDate: string;
  timeAllowed: string;
  questionTypes: Array<{
    type: string;
    count: number;
    marks: number;
  }>;
  totalQuestions: number;
  totalMarks: number;
  difficulty: "easy" | "medium" | "hard";
  instructions: string;
  fileUrl?: string;
  sourceFile?: File;
}

export async function getAssignments(params: AssignmentListParams = {}) {
  const response = await api.get<ApiResponse<Assignment[]>>("/api/assignments", { params });
  return {
    ...response.data,
    data: response.data.data.map(normalizeAssignment)
  };
}

export async function getAssignmentById(id: string) {
  const response = await api.get<ApiResponse<Assignment>>(`/api/assignments/${id}`);
  return normalizeAssignment(response.data.data);
}

export async function createAssignment(payload: CreateAssignmentPayload) {
  const response = await api.post<ApiResponse<{ id: string }>>(
    "/api/assignments",
    payload.sourceFile ? toFormData(payload) : payload,
    {
      headers: payload.sourceFile ? { "Content-Type": "multipart/form-data" } : undefined
    }
  );
  return response.data.data;
}

export async function deleteAssignment(id: string) {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/api/assignments/${id}`);
  return response.data.data;
}

export async function regenerateAssignment(id: string) {
  const response = await api.post<ApiResponse<{ id: string; status: string }>>(
    `/api/assignments/${id}/regenerate`
  );
  return response.data.data;
}

export type QuestionPayload = {
  sectionId?: string;
  type: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  options?: string[];
  answer: string;
};

export type ImproveAction =
  | "make-easier"
  | "make-harder"
  | "improve-wording"
  | "add-hots"
  | "add-numerical";

export async function updateQuestion(
  assignmentId: string,
  questionId: string,
  payload: Partial<QuestionPayload>
) {
  const response = await api.patch<ApiResponse<Assignment>>(
    `/api/assignments/${assignmentId}/questions/${questionId}`,
    payload
  );
  return normalizeAssignment(response.data.data);
}

export async function deleteQuestion(assignmentId: string, questionId: string) {
  const response = await api.delete<ApiResponse<Assignment>>(
    `/api/assignments/${assignmentId}/questions/${questionId}`
  );
  return normalizeAssignment(response.data.data);
}

export async function addQuestion(assignmentId: string, payload: QuestionPayload) {
  const response = await api.post<ApiResponse<Assignment>>(
    `/api/assignments/${assignmentId}/questions`,
    payload
  );
  return normalizeAssignment(response.data.data);
}

export async function regenerateQuestion(assignmentId: string, questionId: string) {
  const response = await api.post<ApiResponse<Assignment>>(
    `/api/assignments/${assignmentId}/questions/${questionId}/regenerate`
  );
  return normalizeAssignment(response.data.data);
}

export async function improveQuestion(
  assignmentId: string,
  questionId: string,
  action: ImproveAction
) {
  const response = await api.post<ApiResponse<Assignment>>(
    `/api/assignments/${assignmentId}/questions/${questionId}/improve`,
    { action }
  );
  return normalizeAssignment(response.data.data);
}

export async function restoreVersion(assignmentId: string, versionIndex: number) {
  const response = await api.post<ApiResponse<Assignment>>(
    `/api/assignments/${assignmentId}/versions/restore`,
    { versionIndex }
  );
  return normalizeAssignment(response.data.data);
}

export async function downloadAssignmentPdf(id: string) {
  const response = await api.get<Blob>(`/api/assignments/${id}/pdf`, {
    responseType: "blob"
  });

  const disposition = response.headers["content-disposition"];
  const fileName = readFileName(disposition) ?? "assignment-paper.pdf";
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function normalizeAssignment(assignment: Assignment): Assignment {
  return {
    ...assignment,
    id: assignment.id ?? assignment._id ?? ""
  };
}

function readFileName(disposition?: string) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1];
}

function toFormData(payload: CreateAssignmentPayload) {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("school", payload.school);
  formData.append("subject", payload.subject);
  formData.append("className", payload.className ?? "");
  formData.append("chapter", payload.chapter);
  formData.append("dueDate", payload.dueDate);
  formData.append("timeAllowed", payload.timeAllowed);
  formData.append("questionTypes", JSON.stringify(payload.questionTypes));
  formData.append("totalQuestions", String(payload.totalQuestions));
  formData.append("totalMarks", String(payload.totalMarks));
  formData.append("difficulty", payload.difficulty);
  formData.append("instructions", payload.instructions);
  formData.append("file", payload.sourceFile as File);

  return formData;
}
