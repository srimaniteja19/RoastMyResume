"use client";

type Props = {
  questions: string[];
  company: string;
};

export function InterviewQuestionsCard({ questions, company }: Props) {
  if (!questions?.length) return null;

  return (
    <section className="glass-card">
      <div className="card-eyebrow">Questions they&apos;ll likely ask</div>
      <p className="mb-4 text-xs text-ink/55">
        Based on your resume — prep these for {company} interviews
      </p>
      <ol className="space-y-3">
        {questions.slice(0, 5).map((q, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/10 font-display text-xs font-bold text-ink">
              {i + 1}
            </span>
            <p className="text-[13px] leading-relaxed text-ink/90">{q}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
