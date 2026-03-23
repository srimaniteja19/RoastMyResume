type Props = {
  score: number;
  firstImpression: string;
  narrativeClarity: string;
  positioningVerdict: string;
  redFlags: string[];
  greenFlags: string[];
};

export function RecruiterEyeCard({
  score,
  firstImpression,
  narrativeClarity,
  positioningVerdict,
  redFlags,
  greenFlags
}: Props) {
  return (
    <section className="ds-card col-span-full animate-fadeUp [animation-delay:70ms]">
      <div className="ds-card-label">Recruiter Eye (6-Second Scan)</div>
      <p className="mb-4 font-display text-3xl font-bold text-ink">{score}</p>
      <div className="mb-4 space-y-3 text-[13px] leading-relaxed text-ink/85">
        <p><strong className="text-ink">First impression:</strong> {firstImpression}</p>
        <p><strong className="text-ink">Narrative:</strong> {narrativeClarity}</p>
        <p><strong className="text-ink">Positioning:</strong> {positioningVerdict}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-green">Green Flags</p>
          <ul className="space-y-1">
            {greenFlags.map((g) => (
              <li key={g} className="flex gap-2 text-[13px] text-ink/85">
                <span className="text-accent-green">✓</span> {g}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-red">Red Flags</p>
          <ul className="space-y-1">
            {redFlags.map((r) => (
              <li key={r} className="flex gap-2 text-[13px] text-ink/85">
                <span className="text-accent-red">✗</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
