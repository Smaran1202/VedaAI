export type AssignmentStatus = "queued" | "processing" | "completed" | "failed";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type UserRole = "teacher" | "student" | "admin";

export interface CurrentUser {
  id?: string;
  _id?: string;
  clerkId: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformSummary {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalAdmins: number;
  totalAssignments: number;
}

export interface WorkspaceProfile {
  id?: string;
  _id?: string;
  userId: string;
  schoolName: string;
  city: string;
  board?: string;
  academicYear?: string;
  defaultClass?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedQuestion {
  id?: string;
  sectionId?: string;
  question: string;
  type?: string;
  difficulty: "easy" | "medium" | "hard" | string;
  marks: number;
  options?: string[];
  answer?: string;
  sourceChunkId?: string;
}

export interface GeneratedSection {
  id?: string;
  title: string;
  instruction: string;
  questionType: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  school: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  instructions: string;
  sections: GeneratedSection[];
  answerKey: Array<{
    questionNumber: number;
    answer: string;
  }>;
}

export interface Assignment {
  id: string;
  _id?: string;
  school?: string;
  title: string;
  subject: string;
  className: string;
  chapter?: string;
  dueDate: string;
  timeAllowed?: string;
  questionTypes: Array<{
    type: string;
    count: number;
    marks: number;
  }>;
  totalQuestions: number;
  totalMarks: number;
  difficulty: Difficulty | string;
  instructions: string;
  fileUrl: string;
  extractedContent?: string;
  status: AssignmentStatus | string;
  generatedPaper?: GeneratedPaper | Record<string, unknown> | null;
  versions?: Array<{
    timestamp: string;
    action: string;
    questionId?: string;
    generatedPaper: GeneratedPaper;
  }>;
  createdAt: string;
  updatedAt: string;
}
