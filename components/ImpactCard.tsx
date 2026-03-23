type Props = {
  score: number;
  xyzCompliance: string;
  strongBullets: string[];
  weakBullets: string[];
  verbQuality: string;
  weakVerbs: string[];
};

export function ImpactCard({ score, xyzCompliance, strongBullets, weakBullets, verbQuality, weakVerbs }: Props) {
  return (
    <section className="ds-card animate-fadeUp [animation-delay:50ms]">
      <div className="ds-card-label">Impact & XYZ Compliance</div>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold text-ink">{score}</span>
        <span className="font-display text-xs font-bold uppercase text-ink/55">Verbs: {verbQuality}</span>
      </div>
      <p className="mb-4 text-[13px] leading-relaxed text-ink/85">{xyzCompliance}</p>
      {weakVerbs.length > 0 && (
        <p className="mb-4 text-[12px] text-accent-red">
          Weak verbs: {weakVerbs.slice(0, 6).join(", ")}
        </p>
      )}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-green">Strong Bullets</p>
          <ul className="space-y-2 text-[13px] text-ink/85">
            {strongBullets.map((b) => (
              <li key={b} className="border-l-2 border-accent-green pl-3">
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-red">Weak Bullets</p>
          <ul className="space-y-2 text-[13px] text-ink/70">
            {weakBullets.map((b) => (
              <li key={b} className="border-l-2 border-accent-red/50 pl-3 line-through opacity-80">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
