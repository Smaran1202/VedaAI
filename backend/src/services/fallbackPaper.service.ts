import type { GeneratedPaper, GeneratedPaperQuestion } from "../types/generated-paper.types";
import { normalizeGeneratedPaper } from "../utils/normalizeGeneratedPaper";
import type { CreateAssignmentInput } from "../validators/assignment.validator";

interface AssignmentLike {
  title: string;
  subject: string;
  dueDate: Date | string;
  questionTypes: CreateAssignmentInput["questionTypes"];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  instructions?: string;
  timeAllowed?: string;
  extractedContent?: string;
  className?: string;
  classSection?: string;
}

interface QuestionDraft {
  question: string;
  answer: string;
  options?: string[];
}

type Category = "mcq" | "short" | "diagram" | "numerical";

const scienceClass5: Record<Category, QuestionDraft[]> = {
  mcq: [
    {
      question: "Which part of a plant absorbs water and minerals from the soil?",
      options: ["A. Leaf", "B. Root", "C. Flower", "D. Stem"],
      answer: "B. Root"
    },
    {
      question: "Which organ pumps blood to all parts of the human body?",
      options: ["A. Lungs", "B. Heart", "C. Stomach", "D. Brain"],
      answer: "B. Heart"
    },
    {
      question: "Which nutrient mainly helps build and repair body tissues?",
      options: ["A. Protein", "B. Water", "C. Sugar", "D. Salt"],
      answer: "A. Protein"
    },
    {
      question: "Which simple machine is used in a seesaw?",
      options: ["A. Pulley", "B. Lever", "C. Screw", "D. Wedge"],
      answer: "B. Lever"
    }
  ],
  short: [
    {
      question: "Explain how green plants prepare their food using sunlight.",
      answer: "Green plants use sunlight, water, carbon dioxide, and chlorophyll to prepare food by photosynthesis."
    },
    {
      question: "Write two ways in which a balanced diet helps the body.",
      answer: "A balanced diet provides energy, supports growth, repairs tissues, and helps prevent illness."
    },
    {
      question: "Why is the skeleton important for movement and protection?",
      answer: "The skeleton gives shape, protects organs such as the brain and heart, and works with muscles to help movement."
    },
    {
      question: "How do decomposers help keep the environment clean?",
      answer: "Decomposers break down dead plants and animals and return nutrients to the soil."
    }
  ],
  diagram: [
    {
      question: "Draw a labelled diagram of a flowering plant showing root, stem, leaf, flower, and fruit.",
      answer: "The diagram should correctly label root, stem, leaf, flower, and fruit."
    },
    {
      question: "Draw and label the main organs of the human digestive system.",
      answer: "The diagram should include mouth, food pipe, stomach, small intestine, and large intestine."
    },
    {
      question: "Draw a simple food chain from grass to a carnivore and label producer, herbivore, and carnivore.",
      answer: "A valid diagram may show grass -> grasshopper/deer -> frog/lion with correct labels."
    }
  ],
  numerical: [
    {
      question: "A lever lifts a 12 kg load using half the effort when the fulcrum is placed correctly. What effort is needed?",
      answer: "Half of 12 kg is 6 kg, so the effort needed is 6 kg."
    },
    {
      question: "A plant grows 3 cm each week. How much taller will it become in 6 weeks?",
      answer: "3 x 6 = 18 cm."
    },
    {
      question: "A class collected 4 kg of dry leaves each day for composting. How many kilograms were collected in 5 days?",
      answer: "4 x 5 = 20 kg."
    }
  ]
};

const scienceClass10: Record<Category, QuestionDraft[]> = {
  mcq: [
    {
      question: "Which gas is evolved when zinc reacts with dilute hydrochloric acid?",
      options: ["A. Oxygen", "B. Hydrogen", "C. Carbon dioxide", "D. Nitrogen"],
      answer: "B. Hydrogen"
    },
    {
      question: "What is the commercial unit of electrical energy?",
      options: ["A. Joule", "B. Watt", "C. Kilowatt-hour", "D. Ampere"],
      answer: "C. Kilowatt-hour"
    },
    {
      question: "Which part of the human alimentary canal absorbs most digested food?",
      options: ["A. Stomach", "B. Small intestine", "C. Large intestine", "D. Oesophagus"],
      answer: "B. Small intestine"
    },
    {
      question: "A convex lens forms a real, inverted image when the object is placed beyond which point?",
      options: ["A. Optical centre", "B. Focus", "C. Principal axis", "D. Pole"],
      answer: "B. Focus"
    }
  ],
  short: [
    {
      question: "Explain why respiration is considered an exothermic process.",
      answer: "Respiration releases energy when glucose is oxidised, so it is an exothermic process."
    },
    {
      question: "Differentiate between combination and decomposition reactions with one example each.",
      answer: "Combination forms one product from reactants, while decomposition breaks one compound into simpler substances."
    },
    {
      question: "Why are acids not stored in metal containers?",
      answer: "Acids can react with metals to produce salts and hydrogen gas, damaging the container."
    },
    {
      question: "State two differences between arteries and veins.",
      answer: "Arteries carry blood away from the heart under high pressure; veins carry blood towards the heart and often have valves."
    }
  ],
  diagram: [
    {
      question: "Draw a labelled diagram showing the human respiratory system with trachea, bronchi, lungs, and diaphragm.",
      answer: "The diagram should label trachea, bronchi, lungs, and diaphragm correctly."
    },
    {
      question: "Draw the ray diagram for image formation by a convex lens when the object is beyond 2F.",
      answer: "The image should be real, inverted, diminished, and formed between F and 2F on the other side."
    },
    {
      question: "Draw a labelled circuit diagram to verify Ohm's law using an ammeter, voltmeter, resistor, and key.",
      answer: "The circuit should show ammeter in series and voltmeter parallel to the resistor."
    },
    {
      question: "Draw and label the structure of a neuron.",
      answer: "The diagram should include dendrites, cell body, axon, and nerve endings."
    }
  ],
  numerical: [
    {
      question: "A 5 ohm resistor carries a current of 2 A. Calculate the potential difference across it.",
      answer: "Using V = IR, V = 2 x 5 = 10 V."
    },
    {
      question: "An appliance rated 1000 W is used for 2 hours. Calculate the electrical energy consumed in kWh.",
      answer: "Energy = 1 kW x 2 h = 2 kWh."
    },
    {
      question: "A ray of light enters glass from air and slows down. If the angle of incidence is 45 degrees, will the ray bend towards or away from the normal?",
      answer: "It bends towards the normal because light slows down in the denser medium."
    },
    {
      question: "Calculate the resistance of a wire when 12 V produces a current of 0.5 A through it.",
      answer: "R = V/I = 12/0.5 = 24 ohm."
    }
  ]
};

const genericMath: Record<Category, QuestionDraft[]> = {
  mcq: [
    {
      question: "Which fraction is equivalent to 3/5?",
      options: ["A. 6/10", "B. 4/10", "C. 3/10", "D. 5/8"],
      answer: "A. 6/10"
    },
    {
      question: "How many degrees are there in a right angle?",
      options: ["A. 45", "B. 60", "C. 90", "D. 180"],
      answer: "C. 90"
    }
  ],
  short: [
    {
      question: "Convert 7/8 into a decimal.",
      answer: "7/8 = 0.875."
    },
    {
      question: "Find the perimeter of a rectangle with length 12 cm and breadth 7 cm.",
      answer: "Perimeter = 2 x (12 + 7) = 38 cm."
    }
  ],
  diagram: [
    {
      question: "Draw a rectangle and mark its length, breadth, diagonals, and right angles.",
      answer: "The rectangle should show opposite sides equal, diagonals, and right angles."
    },
    {
      question: "Draw a circle and label its centre, radius, diameter, and circumference.",
      answer: "The circle should correctly label centre, radius, diameter, and circumference."
    }
  ],
  numerical: [
    {
      question: "A notebook costs Rs 45. How much will 8 notebooks cost?",
      answer: "45 x 8 = Rs 360."
    },
    {
      question: "A rectangle has length 15 cm and breadth 9 cm. Find its area.",
      answer: "Area = 15 x 9 = 135 sq cm."
    },
    {
      question: "Add 24.75 and 18.60.",
      answer: "24.75 + 18.60 = 43.35."
    }
  ]
};

const genericEnglish: Record<Category, QuestionDraft[]> = {
  mcq: [
    {
      question: "Choose the correct article: She saw ___ owl on the branch.",
      options: ["A. a", "B. an", "C. the", "D. no article"],
      answer: "B. an"
    },
    {
      question: "Which word is an adjective in the sentence: The silent forest looked beautiful?",
      options: ["A. forest", "B. looked", "C. silent", "D. the"],
      answer: "C. silent"
    }
  ],
  short: [
    {
      question: "Rewrite the sentence in past tense: The children play near the park.",
      answer: "The children played near the park."
    },
    {
      question: "Write a meaningful sentence using the word 'responsible'.",
      answer: "A correct answer should use 'responsible' clearly in a sentence."
    }
  ],
  diagram: [
    {
      question: "Create a word web for the word 'courage' with four related words.",
      answer: "Suitable related words include bravery, confidence, strength, and determination."
    }
  ],
  numerical: [
    {
      question: "Read a short passage and identify three verbs in the order they appear.",
      answer: "The answer should list three action words from the passage in order."
    }
  ]
};

export function generateFallbackPaper(assignment: AssignmentLike): GeneratedPaper {
  let questionNumber = 1;
  const answerKey: GeneratedPaper["answerKey"] = [];
  const subjectKey = normalizeSubject(assignment.subject);
  const classLevel = getClassLevel(assignment.className ?? assignment.classSection ?? "5th");
  const contentDrafts = getContentDrafts(assignment.extractedContent);
  const bank = contentDrafts ?? getBank(subjectKey, classLevel);

  const sections = assignment.questionTypes.map((questionType, index) => {
    const category = getQuestionCategory(questionType.type);
    const drafts = bank[category] ?? bank.short;
    const questions: GeneratedPaperQuestion[] = Array.from({ length: questionType.count }).map((_, questionIndex) => {
      const draft = drafts[questionIndex % drafts.length];
      const generatedDraft = questionIndex >= drafts.length
        ? createFollowUpDraft(draft, questionIndex)
        : draft;

      answerKey.push({
        questionNumber,
        answer: generatedDraft.answer
      });
      questionNumber += 1;

      return {
        question: generatedDraft.question,
        difficulty: difficultyFor(questionIndex),
        marks: questionType.marks,
        ...(generatedDraft.options ? { options: generatedDraft.options } : {})
      };
    });

    return {
      title: `Section ${String.fromCharCode(65 + index)}`,
      instruction: `Attempt all questions. Each question carries ${questionType.marks} marks.`,
      questionType: questionType.type,
      questions
    };
  });

  return normalizeGeneratedPaper({
    school: "Delhi Public School, Sector-4, Bokaro",
    subject: assignment.subject,
    className: assignment.className ?? assignment.classSection ?? "5th",
    timeAllowed: assignment.timeAllowed || "45 minutes",
    maximumMarks: assignment.totalMarks,
    instructions:
      assignment.instructions?.trim() ||
      "All questions are compulsory unless stated otherwise.",
    sections,
    answerKey
  });
}

function normalizeSubject(subject: string) {
  const value = subject.toLowerCase();

  if (value.includes("math")) {
    return "math";
  }

  if (value.includes("english")) {
    return "english";
  }

  return "science";
}

function getClassLevel(className: string) {
  const match = className.match(/\d+/);
  return match ? Number(match[0]) : 5;
}

function getBank(subject: string, classLevel: number) {
  if (subject === "math") {
    return genericMath;
  }

  if (subject === "english") {
    return genericEnglish;
  }

  return classLevel >= 9 ? scienceClass10 : scienceClass5;
}

function getQuestionCategory(type: string): Category {
  const value = type.toLowerCase();

  if (value.includes("multiple") || value.includes("mcq")) {
    return "mcq";
  }

  if (value.includes("diagram") || value.includes("graph")) {
    return "diagram";
  }

  if (value.includes("numerical") || value.includes("problem")) {
    return "numerical";
  }

  return "short";
}

function difficultyFor(index: number) {
  return ["easy", "medium", "hard"][index % 3];
}

function createFollowUpDraft(draft: QuestionDraft, index: number): QuestionDraft {
  return {
    ...draft,
    question: `${draft.question} Give a different supporting reason or calculation for part ${index + 1}.`,
    answer: draft.answer
  };
}

function getContentDrafts(extractedContent?: string): Record<Category, QuestionDraft[]> | null {
  const source = extractedContent?.trim();

  if (!source) {
    return null;
  }

  const sentences = source
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 40)
    .slice(0, 12);

  if (!sentences.length) {
    return null;
  }

  const short = sentences.map((sentence, index) => ({
    question: `Based on the uploaded material, explain the idea described in this line: "${clip(sentence, 140)}"`,
    answer: sentence
  }));

  const mcq = sentences.slice(0, Math.max(4, Math.min(sentences.length, 8))).map((sentence, index) => {
    const keyword = pickKeyword(sentence);

    return {
      question: `According to the uploaded material, which option best relates to "${keyword}"?`,
      options: [
        `A. ${keyword}`,
        `B. ${pickKeyword(sentences[(index + 1) % sentences.length])}`,
        `C. ${pickKeyword(sentences[(index + 2) % sentences.length])}`,
        `D. ${pickKeyword(sentences[(index + 3) % sentences.length])}`
      ],
      answer: `A. ${keyword}`
    };
  });

  const diagram = sentences.slice(0, 6).map((sentence, index) => ({
    question: `Create a labelled diagram or flow chart showing the process or relationship described here: "${clip(sentence, 120)}"`,
    answer: `The diagram should accurately represent: ${sentence}`
  }));

  const numerical = sentences.slice(0, 6).map((sentence, index) => ({
    question: `Frame and solve a data-based question using the fact from the uploaded material: "${clip(sentence, 120)}"`,
    answer: `The solution must use only this uploaded-material fact: ${sentence}`
  }));

  return {
    mcq,
    short,
    diagram,
    numerical
  };
}

function clip(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

function pickKeyword(sentence: string) {
  const words = sentence
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4);

  return words[0] ?? "uploaded material";
}
