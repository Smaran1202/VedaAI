export interface GeneratedPaperQuestion {
  id?: string;
  sectionId?: string;
  question: string;
  type?: string;
  difficulty: string;
  marks: number;
  options?: string[];
  answer?: string;
  sourceChunkId?: string;
}

export interface GeneratedPaperSection {
  id?: string;
  title: string;
  instruction: string;
  questionType: string;
  questions: GeneratedPaperQuestion[];
}

export interface GeneratedPaperAnswer {
  questionNumber: number;
  answer: string;
}

export interface GeneratedPaper {
  school: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  instructions: string;
  sections: GeneratedPaperSection[];
  answerKey: GeneratedPaperAnswer[];
}
