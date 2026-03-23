"use client";

type Props = {
  actions: string[];
};

export function TopActionsCard({ actions }: Props) {
  if (!actions?.length) return null;

  return (
    <section className="glass-card">
      <div className="card-eyebrow">Top 3 actions</div>
      <p className="mb-4 text-xs text-ink/55">
        Highest impact changes — do these first
      </p>
      <ul className="space-y-3">
        {actions.slice(0, 3).map((action, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-xs font-bold text-white">
              {i + 1}
            </span>
            <p className="text-[13px] leading-relaxed text-ink/90">{action}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
