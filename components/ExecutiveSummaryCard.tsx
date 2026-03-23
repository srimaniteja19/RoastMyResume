"use client";

type Props = {
  summary: string;
};

export function ExecutiveSummaryCard({ summary }: Props) {
  if (!summary?.trim()) return null;

  return (
    <div className="rounded-xl border-l-4 border-ink/20 bg-ink/5 p-5">
      <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-ink/50">
        Overall take
      </p>
      <p className="text-[14px] leading-relaxed text-ink/90">{summary}</p>
    </div>
  );
}
