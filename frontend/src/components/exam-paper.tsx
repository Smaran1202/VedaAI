import type { GeneratedPaper } from "@/types";
import { DifficultyBadge } from "@/components/difficulty-badge";

export function ExamPaper({
  paper
}: {
  paper: GeneratedPaper;
}) {
  const displayPaper = dedupePaperForDisplay(paper);

  return (
    <article className="mx-auto w-full max-w-[850px] rounded-2xl border border-line bg-white p-5 text-neutral-950 shadow-card md:p-9 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
      <header className="border-b border-neutral-300 pb-5 text-center font-serif">
        <h2 className="text-xl font-bold leading-tight md:text-2xl">{displayPaper.school}</h2>
        <p className="mt-3 text-sm font-semibold">Subject: {displayPaper.subject}</p>
        <p className="mt-1 text-sm font-semibold">Class: {displayPaper.className}</p>
      </header>

      <div className="flex flex-col gap-2 border-b border-neutral-300 py-3 text-sm font-bold sm:flex-row sm:justify-between">
        <p>Time Allowed: {displayPaper.timeAllowed}</p>
        <p>Maximum Marks: {displayPaper.maximumMarks}</p>
      </div>

      <p className="mt-4 text-sm font-semibold leading-6">
        Instruction: {displayPaper.instructions}
      </p>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <p>Name: <span className="inline-block min-w-44 border-b border-neutral-500" /></p>
        <p>Roll Number: <span className="inline-block min-w-32 border-b border-neutral-500" /></p>
        <p className="sm:col-span-2">Class/Section: <span className="inline-block min-w-40 border-b border-neutral-500" /></p>
      </div>

      {displayPaper.sections.map((section) => (
        <section key={section.title} className="mt-7">
          <h3 className="text-center font-serif text-lg font-bold">{section.title}</h3>
          <p className="mt-4 text-sm font-black">{section.questionType}</p>
          <p className="mt-1 text-sm text-neutral-600">{section.instruction}</p>

          <ol className="mt-5 space-y-4 list-none">
            {section.questions.map((question, index) => (
              <li key={`${section.title}-${index}`} className="grid gap-2 text-sm leading-6 sm:grid-cols-[28px_1fr_auto]">
                <span className="font-black">{index + 1}.</span>
                <span>{question.question}</span>
                <div className="flex items-start gap-2">
                  <DifficultyBadge difficulty={question.difficulty} />
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-black">{question.marks}M</span>
                </div>
                {question.options?.length ? (
                  <ul className="sm:col-start-2 grid gap-1 text-sm text-neutral-700 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <li key={option} className="rounded-xl border border-line bg-neutral-50 px-3 py-1.5">
                        {formatOption(option, optionIndex)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="mt-8 border-t border-neutral-300 pt-5 text-center text-sm font-black">End of Question Paper.</p>

      <section className="mt-8 rounded-2xl border border-line bg-neutral-50 p-4">
        <h3 className="text-base font-black">Answer Key</h3>
        <ol className="mt-3 space-y-2 text-sm leading-6">
          {displayPaper.answerKey.map((answer) => (
            <li key={answer.questionNumber}>
              <span className="font-black">{answer.questionNumber}.</span> {answer.answer}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

function formatOption(option: string, optionIndex: number) {
  return /^[A-D]\.\s/.test(option)
    ? option
    : `${String.fromCharCode(65 + optionIndex)}. ${option}`;
}

function dedupePaperForDisplay(paper: GeneratedPaper): GeneratedPaper {
  const seen = new Set<string>();
  const answersByOriginalNumber = new Map(
    paper.answerKey.map((answer) => [answer.questionNumber, answer.answer])
  );
  let originalNumber = 1;
  let displayNumber = 1;
  const answerKey: GeneratedPaper["answerKey"] = [];

  const sections = paper.sections
    .map((section) => {
      const questions = section.questions.filter((question) => {
        const key = question.question.trim().toLowerCase().replace(/\s+/g, " ");
        const answer = answersByOriginalNumber.get(originalNumber);
        originalNumber += 1;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        answerKey.push({
          questionNumber: displayNumber,
          answer: answer ?? "Answer should match the accepted textbook explanation."
        });
        displayNumber += 1;
        return true;
      });

      return {
        ...section,
        questions
      };
    })
    .filter((section) => section.questions.length > 0);

  return {
    ...paper,
    sections,
    answerKey
  };
}
