type Props = {
  score: number;
  techStackPresent: string[];
  senioritySignals: string[];
  seniorityGaps: string[];
  depthVerdict: string;
};

export function TechnicalDepthCard({
  score,
  techStackPresent,
  senioritySignals,
  seniorityGaps,
  depthVerdict
}: Props) {
  return (
    <section className="ds-card animate-fadeUp [animation-delay:60ms]">
      <div className="ds-card-label">Technical Depth</div>
      <p className="mb-4 font-display text-3xl font-bold text-ink">{score}</p>
      <p className="mb-4 text-[13px] leading-relaxed text-ink/85">{depthVerdict}</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {techStackPresent.slice(0, 15).map((t) => (
          <span key={t} className="rounded-lg bg-ink/10 px-2.5 py-0.5 font-mono text-[11px] text-ink/85">
            {t}
          </span>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-green">Seniority Signals</p>
          <ul className="space-y-1 text-[12px] text-ink/85">
            {senioritySignals.map((s) => (
              <li key={s}>✓ {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-red">Seniority Gaps</p>
          <ul className="space-y-1 text-[12px] text-ink/85">
            {seniorityGaps.map((g) => (
              <li key={g}>✗ {g}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
