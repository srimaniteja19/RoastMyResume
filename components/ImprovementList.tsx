import type { ImprovementItem } from "@/lib/types";

const BADGE_STYLES: Record<string, string> = {
  CRITICAL: "bg-[rgba(255,23,68,0.1)] text-[#c0001a]",
  HIGH: "bg-[rgba(255,152,0,0.1)] text-[#e65100]",
  MEDIUM: "bg-[rgba(33,150,243,0.1)] text-[#0d47a1]"
};

type Props = {
  improvements: ImprovementItem[];
};

export function ImprovementList({ improvements }: Props) {
  return (
    <div className="flex flex-col">
        {improvements.map((item, i) => (
          <div
            key={`${item.issue}-${i}`}
            className="flex gap-4 border-b border-[rgba(26,26,46,0.07)] py-4 last:border-b-0"
          >
            <div className="font-display text-[2rem] font-extrabold leading-tight text-[rgba(26,26,46,0.12)]">
              0{i + 1}
            </div>
            <div className="flex-1">
              <div
                className={`mb-1.5 inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  BADGE_STYLES[item.priority] ?? BADGE_STYLES.MEDIUM
                }`}
              >
                {item.priority}
              </div>
              <div className="text-[13px] leading-relaxed text-ink2">
                <strong>{item.issue}</strong>
                <br />
                <span className="text-[rgba(26,26,46,0.5)]">{item.fix}</span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
