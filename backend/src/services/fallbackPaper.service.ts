import type { GeneratedPaper, GeneratedPaperQuestion } from "../types/generated-paper.types";
import { normalizeGeneratedPaper } from "../utils/normalizeGeneratedPaper";
import type { CreateAssignmentInput } from "../validators/assignment.validator";

interface AssignmentLike {
  school?: string;
  title: string;
  subject: string;
  chapter?: string;
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

type Category = "mcq" | "short" | "diagram" | "numerical" | "long" | "hots";

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
  ],
  long: [
    {
      question: "Explain how plants, animals, and decomposers depend on one another in an ecosystem.",
      answer: "Plants make food, animals depend on plants or other animals, and decomposers return nutrients to the soil."
    }
  ],
  hots: [
    {
      question: "Why would removing decomposers from an ecosystem create problems for plants and animals?",
      answer: "Dead matter would not break down properly, nutrients would not return to soil, and plant growth would be affected."
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
      question: "Which process is used to separate a mixture of salt and water?",
      options: ["A. Evaporation", "B. Magnetism", "C. Filtration only", "D. Handpicking"],
      answer: "A. Evaporation"
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
      question: "Draw a labelled diagram showing the laboratory preparation of hydrogen gas from zinc and dilute hydrochloric acid.",
      answer: "The diagram should show zinc, dilute hydrochloric acid, delivery tube, and gas collection."
    },
    {
      question: "Draw a flow chart showing the steps involved in balancing a chemical equation.",
      answer: "The flow chart should show writing formulae, counting atoms, adding coefficients, and checking balance."
    },
    {
      question: "Draw and label the structure of a neuron.",
      answer: "The diagram should include dendrites, cell body, axon, and nerve endings."
    }
  ],
  numerical: [
    {
      question: "If 2 grams of hydrogen reacts with 16 grams of oxygen to form water, what mass of water is formed?",
      answer: "By conservation of mass, 2 g + 16 g = 18 g of water."
    },
    {
      question: "A compound contains 12 grams of carbon and 32 grams of oxygen. What is the total mass of the compound?",
      answer: "12 g + 32 g = 44 g."
    },
    {
      question: "A ray of light enters glass from air and slows down. If the angle of incidence is 45 degrees, will the ray bend towards or away from the normal?",
      answer: "It bends towards the normal because light slows down in the denser medium."
    },
    {
      question: "If 10 grams of reactant A combines with 15 grams of reactant B, calculate the mass of product formed.",
      answer: "By conservation of mass, 10 g + 15 g = 25 g."
    }
  ],
  long: [
    {
      question: "Explain how different systems in the human body work together to maintain life processes.",
      answer: "Digestive, respiratory, circulatory, and excretory systems work together to provide nutrients, oxygen, transport, and waste removal."
    }
  ],
  hots: [
    {
      question: "Why must a chemical equation be balanced before using it to explain a reaction?",
      answer: "A balanced equation follows conservation of mass and shows the correct ratio of reactants and products."
    }
  ]
};

const genericChemistry: Record<Category, QuestionDraft[]> = {
  mcq: [
    {
      question: "Which property makes alkali metals highly reactive in the s block?",
      options: ["A. They lose one valence electron easily", "B. They are chemically inert", "C. They have completely filled shells", "D. They do not form ions"],
      answer: "A. They lose one valence electron easily"
    },
    {
      question: "Which group of elements is known as alkaline earth metals?",
      options: ["A. Group 2", "B. Group 17", "C. Group 18", "D. Group 14"],
      answer: "A. Group 2"
    }
  ],
  short: [
    {
      question: "Explain why s block elements are generally reactive metals.",
      answer: "They have one or two valence electrons that are lost easily to form positive ions."
    },
    {
      question: "State two differences between alkali metals and alkaline earth metals.",
      answer: "Alkali metals are Group 1 and form +1 ions, while alkaline earth metals are Group 2 and form +2 ions."
    }
  ],
  diagram: [
    {
      question: "Draw a simple periodic table outline and mark the position of s block elements.",
      answer: "The diagram should mark Groups 1 and 2 and helium as part of the s block."
    }
  ],
  numerical: [
    {
      question: "An s block element forms MCl. What is the likely charge on the metal ion?",
      answer: "The metal ion is likely +1 because chloride has a -1 charge."
    }
  ],
  long: [
    {
      question: "Describe the general electronic configuration and chemical behaviour of s block elements.",
      answer: "S block elements have valence electrons in the s orbital and commonly form positive ions by losing those electrons."
    }
  ],
  hots: [
    {
      question: "Why does reactivity increase down Group 1 in the s block? Give a reason based on atomic size.",
      answer: "Atomic size increases down the group, so the outer electron is lost more easily due to weaker attraction."
    }
  ]
};

const genericSubjectBank: Record<Category, QuestionDraft[]> = {
  mcq: [
    {
      question: "Which statement best matches the selected chapter topic?",
      options: ["A. It explains the central concept of the chapter", "B. It belongs to an unrelated subject", "C. It ignores the given topic", "D. It changes the selected class level"],
      answer: "A. It explains the central concept of the chapter"
    }
  ],
  short: [
    {
      question: "Explain one important concept from the selected chapter in your own words.",
      answer: "The answer should explain a concept from the selected subject and chapter."
    }
  ],
  diagram: [
    {
      question: "Create a labelled concept map for the selected chapter topic.",
      answer: "The concept map should show relevant terms and relationships from the selected chapter."
    }
  ],
  numerical: [
    {
      question: "Create a data-based question only if the selected chapter supports numerical reasoning.",
      answer: "The solution should use values relevant to the selected chapter."
    }
  ],
  long: [
    {
      question: "Describe the main ideas of the selected chapter and explain how they are connected.",
      answer: "The answer should connect key ideas from the selected subject and chapter."
    }
  ],
  hots: [
    {
      question: "Why is the selected chapter topic important for understanding the subject more deeply?",
      answer: "The answer should give a reasoned explanation based on the selected chapter."
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
  ],
  long: [
    {
      question: "Explain the steps used to solve a multi-step word problem involving area and perimeter.",
      answer: "Identify given dimensions, choose the correct formula, calculate carefully, and include units."
    }
  ],
  hots: [
    {
      question: "How can two rectangles have the same area but different perimeters? Explain with an example.",
      answer: "Different length and breadth pairs can multiply to the same area but add to different perimeters."
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
  ],
  long: [
    {
      question: "Write a paragraph explaining how word choice changes the mood of a story.",
      answer: "A strong answer explains how descriptive words, tone, and imagery shape the reader's feeling."
    }
  ],
  hots: [
    {
      question: "Why might two readers interpret the same character differently? Support your answer with reasons.",
      answer: "Readers may focus on different actions, motives, experiences, or details from the text."
    }
  ]
};

const genericSocial: Record<Category, QuestionDraft[]> = {
  mcq: [
    {
      question: "Which source is most useful for studying a historical event?",
      options: ["A. Primary source", "B. Random guess", "C. Chemical formula", "D. Lab apparatus"],
      answer: "A. Primary source"
    },
    {
      question: "What does a political map mainly show?",
      options: ["A. Countries and boundaries", "B. Rivers and mountains only", "C. Climate patterns only", "D. Trade goods only"],
      answer: "A. Countries and boundaries"
    }
  ],
  short: [
    {
      question: "Explain why historians compare different sources before writing about the past.",
      answer: "Historians compare sources to check reliability, reduce bias, and build a fuller account of events."
    },
    {
      question: "Describe how geography can influence the development of a society.",
      answer: "Geography affects settlement, trade, agriculture, transport, and interaction with other regions."
    }
  ],
  diagram: [
    {
      question: "Draw a simple timeline showing four major events from the chapter in correct order.",
      answer: "The timeline should place events in chronological order with clear labels."
    },
    {
      question: "Draw a labelled map sketch showing the important region discussed in the chapter.",
      answer: "The map sketch should identify the relevant region and key places from the topic."
    }
  ],
  numerical: [
    {
      question: "A timeline marks events in 1905, 1917, and 1947. Calculate the gap between the first and last event.",
      answer: "1947 - 1905 = 42 years."
    },
    {
      question: "If a historical period lasted from 1857 to 1947, calculate its duration.",
      answer: "1947 - 1857 = 90 years."
    }
  ],
  long: [
    {
      question: "Explain how nationalism influenced political changes in nineteenth-century Europe.",
      answer: "Nationalism encouraged people with shared language, culture, or history to demand unified or independent nation-states."
    }
  ],
  hots: [
    {
      question: "Why did ideas of liberty and equality create conflict with monarchies and empires?",
      answer: "These ideas challenged inherited power and encouraged people to demand representative government and national self-determination."
    }
  ]
};

export function generateFallbackPaper(assignment: AssignmentLike): GeneratedPaper {
  let questionNumber = 1;
  const answerKey: GeneratedPaper["answerKey"] = [];
  const subjectKey = normalizeSubject(assignment.subject);
  const classLevel = getClassLevel(assignment.className ?? assignment.classSection ?? "");
  const contentDrafts = getContentDrafts(assignment);
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
    school: assignment.school || "Your School",
    subject: assignment.subject,
    className: assignment.className ?? assignment.classSection ?? "the selected class",
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

  if (value.includes("chem")) {
    return "chemistry";
  }

  if (value.includes("physics")) {
    return "physics";
  }

  if (value.includes("english")) {
    return "english";
  }

  if (
    value.includes("social") ||
    value.includes("history") ||
    value.includes("civics") ||
    value.includes("geography")
  ) {
    return "social";
  }

  if (value.includes("science")) {
    return "science";
  }

  return "generic";
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

  if (subject === "chemistry") {
    return genericChemistry;
  }

  if (subject === "social") {
    return genericSocial;
  }

  if (subject === "science" || subject === "physics") {
    return classLevel >= 9 ? scienceClass10 : scienceClass5;
  }

  return genericSubjectBank;
}

function getQuestionCategory(type: string): Category {
  const value = type.toLowerCase();

  if (value.includes("multiple") || value.includes("mcq")) {
    return "mcq";
  }

  if (value.includes("diagram") || value.includes("graph")) {
    return "diagram";
  }

  if (value.includes("long")) {
    return "long";
  }

  if (value.includes("hots") || value.includes("higher")) {
    return "hots";
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

function getContentDrafts(assignment: AssignmentLike): Record<Category, QuestionDraft[]> | null {
  const source = assignment.extractedContent?.trim();

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

  const concepts = extractConcepts(source, assignment);
  const chapter = assignment.chapter || assignment.title;

  const short = concepts.map((concept, index) => ({
    question: `Explain the importance of ${concept.label} in the chapter ${chapter}.`,
    answer: concept.evidence
  }));

  const mcq = concepts.map((concept, index) => {
    const distractors = buildConceptDistractors(concepts, index, assignment.subject);

    return {
      question: buildMcqStem(concept, assignment),
      options: [
        `A. ${concept.answer}`,
        `B. ${distractors[0]}`,
        `C. ${distractors[1]}`,
        `D. ${distractors[2]}`
      ],
      answer: `A. ${concept.answer}`
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

  const long = concepts.map((concept) => ({
    question: `Describe the causes and effects connected with ${concept.label} using evidence from the uploaded material.`,
    answer: concept.evidence
  }));

  const hots = concepts.map((concept) => ({
    question: `Why might ${concept.label} be considered important for understanding the wider chapter topic? Give reasons from the uploaded material.`,
    answer: concept.evidence
  }));

  return {
    mcq,
    short,
    diagram,
    numerical,
    long,
    hots
  };
}

function clip(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

interface ExtractedConcept {
  label: string;
  answer: string;
  evidence: string;
}

function extractConcepts(source: string, assignment: AssignmentLike): ExtractedConcept[] {
  const sentences = source
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 40);
  const conceptMap = new Map<string, ExtractedConcept>();
  const topicHints = [assignment.chapter, assignment.title, assignment.subject]
    .filter(Boolean)
    .join(" ");

  for (const sentence of sentences) {
    const label = extractConceptLabel(sentence, topicHints);

    if (!label || conceptMap.has(label.toLowerCase())) {
      continue;
    }

    conceptMap.set(label.toLowerCase(), {
      label,
      answer: buildAnswerStatement(label, sentence),
      evidence: sentence
    });
  }

  if (!conceptMap.size) {
    conceptMap.set("the main idea of the uploaded material", {
      label: "the main idea of the uploaded material",
      answer: "It explains the central concept discussed in the chapter.",
      evidence: sentences[0] ?? source.slice(0, 240)
    });
  }

  return Array.from(conceptMap.values()).slice(0, 10);
}

function extractConceptLabel(sentence: string, topicHints: string) {
  const properPhrase = sentence.match(/\b([A-Z][a-z]+(?:\s+(?:of|von|de|the|and|[A-Z][a-z]+)){0,4})\b/);

  if (properPhrase && !weakConcepts.has(properPhrase[1].toLowerCase())) {
    return properPhrase[1].trim();
  }

  const phrases = sentence
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3 && !weakConcepts.has(word.toLowerCase()));

  const topicWords = topicHints
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);
  const topicMatch = phrases.find((word) => topicWords.includes(word.toLowerCase()));

  if (topicMatch) {
    return topicMatch;
  }

  return phrases.slice(0, 3).join(" ");
}

function buildAnswerStatement(label: string, sentence: string) {
  const cleaned = clip(sentence, 150);
  return `${label} is important because ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
}

function buildMcqStem(concept: ExtractedConcept, assignment: AssignmentLike) {
  const subject = assignment.subject.toLowerCase();

  if (subject.includes("history") || subject.includes("social")) {
    return `Which statement best explains the significance of ${concept.label} in the chapter?`;
  }

  return `Which statement correctly explains ${concept.label} in the uploaded material?`;
}

function buildConceptDistractors(
  concepts: ExtractedConcept[],
  index: number,
  subject: string
) {
  const conceptDistractors = concepts
    .filter((_, conceptIndex) => conceptIndex !== index)
    .map((concept) => concept.answer)
    .filter((answer) => answer.split(/\s+/).length >= 5);
  const subjectFallbacks = subject.toLowerCase().includes("history") || subject.toLowerCase().includes("social")
    ? [
        "It was unrelated to the political changes discussed in the chapter.",
        "It reduced the importance of nationalism in the period.",
        "It was mainly a scientific discovery rather than a historical development."
      ]
    : [
        "It is unrelated to the main concept in the uploaded material.",
        "It explains a different idea not supported by the context.",
        "It gives an incomplete explanation of the selected topic."
      ];

  return [...conceptDistractors, ...subjectFallbacks].slice(0, 3);
}

const weakConcepts = new Set([
  "under",
  "over",
  "into",
  "between",
  "during",
  "after",
  "before",
  "which",
  "where",
  "there",
  "their",
  "chapter",
  "history",
  "social",
  "material"
]);
