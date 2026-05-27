export interface GeneratedPaperQuestion {
  question: string;
  difficulty: string;
  marks: number;
  options?: string[];
}

export interface GeneratedPaperSection {
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
