type Props = {
  title: string;
  phrases: string[];
  variant: "strong" | "weak" | "buzz";
};

const variantConfig = {
  strong: {
    tag: "strong",
    card: "bg-emerald-50/80 border-emerald-200/80",
    title: "text-emerald-800",
    sub: "text-emerald-700/70"
  },
  weak: {
    tag: "weak",
    card: "bg-red-50/80 border-red-200/80",
    title: "text-red-800",
    sub: "text-red-700/70"
  },
  buzz: {
    tag: "buzz",
    card: "bg-amber-50/80 border-amber-200/80",
    title: "text-amber-800",
    sub: "text-amber-700/70"
  }
} as const;

export function PhraseSection({ title, phrases, variant }: Props) {
  if (phrases.length === 0) return null;
  const cfg = variantConfig[variant];
  const delay = variant === "strong" ? "150ms" : variant === "weak" ? "200ms" : "210ms";
  return (
    <section
      className={`animate-fadeUp rounded-2xl border p-6 backdrop-blur-sm ${cfg.card} [animation-delay:${delay}]`}
    >
      <h3 className={`font-display text-lg font-bold ${cfg.title}`}>{title}</h3>
      <p className={`mt-1 text-xs ${cfg.sub}`}>
        {variant === "strong"
          ? "These are the deciding words about you"
          : variant === "weak"
            ? "Stuff that screams 'next applicant.'"
            : "Overused phrases that dilute impact"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {phrases.map((p) => (
          <span key={p} className={`phrase-tag ${cfg.tag}`}>
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
