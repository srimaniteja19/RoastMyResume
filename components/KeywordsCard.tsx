"use client";

type Props = {
  present: string[];
  missing: string[];
  company: string;
};

export function KeywordsCard({ present, missing, company }: Props) {
  if (present.length === 0 && missing.length === 0) return null;

  return (
    <section className="glass-card">
      <div className="card-eyebrow">ATS Keywords · {company}</div>
      <div className="space-y-4">
        {present.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-[#00703a]">Found in resume</p>
            <div className="flex flex-wrap gap-1.5">
              {present.slice(0, 16).map((k) => (
                <span
                  key={k}
                  className="rounded-md bg-[rgba(0,200,83,0.15)] px-2 py-0.5 text-[11px] font-medium text-[#00703a]"
                >
                  {k}
                </span>
              ))}
              {present.length > 16 && (
                <span className="text-[11px] text-ink/50">+{present.length - 16} more</span>
              )}
            </div>
          </div>
        )}
        {missing.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-[#c0001a]">Consider adding</p>
            <div className="flex flex-wrap gap-1.5">
              {missing.slice(0, 10).map((k) => (
                <span
                  key={k}
                  className="rounded-md border border-[rgba(255,23,68,0.25)] bg-[rgba(255,23,68,0.06)] px-2 py-0.5 text-[11px] text-[#c0001a]"
                >
                  {k}
                </span>
              ))}
              {missing.length > 10 && (
                <span className="text-[11px] text-ink/50">+{missing.length - 10} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
