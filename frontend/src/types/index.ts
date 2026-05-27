export type AssignmentStatus = "queued" | "processing" | "completed" | "failed";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface GeneratedQuestion {
  question: string;
  difficulty: "easy" | "medium" | "hard" | string;
  marks: number;
  options?: string[];
}

export interface GeneratedSection {
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
  title: string;
  subject: string;
  className: string;
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
  status: AssignmentStatus | string;
  generatedPaper?: GeneratedPaper | Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
