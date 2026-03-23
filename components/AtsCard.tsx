type Props = {
  score: number;
  formatVerdict: string;
  issues: string[];
  keywordsPresent: string[];
  keywordsMissing: string[];
};

export function AtsCard({ score, formatVerdict, issues, keywordsPresent, keywordsMissing }: Props) {
  const formatColor =
    formatVerdict === "PASS" ? "text-accent-green" : formatVerdict === "WARN" ? "text-amber-600" : "text-accent-red";

  return (
    <section className="ds-card animate-fadeUp [animation-delay:40ms]">
      <div className="ds-card-label">ATS Parser</div>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold text-ink">{score}</span>
        <span className={`font-display text-xs font-bold uppercase ${formatColor}`}>Format: {formatVerdict}</span>
      </div>
      {issues.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/55">Issues</p>
          <ul className="space-y-1 text-[13px] text-ink/85">
            {issues.map((i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent-red">•</span> {i}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-green">Keywords Present</p>
          <div className="flex flex-wrap gap-1.5">
            {keywordsPresent.slice(0, 12).map((k) => (
              <span key={k} className="rounded-lg bg-accent-green/15 px-2.5 py-0.5 font-mono text-[11px] text-accent-green">
                {k}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-red">Keywords Missing</p>
          <div className="flex flex-wrap gap-1.5">
            {keywordsMissing.slice(0, 8).map((k) => (
              <span key={k} className="rounded-lg bg-accent-red/12 px-2.5 py-0.5 font-mono text-[11px] text-accent-red">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
