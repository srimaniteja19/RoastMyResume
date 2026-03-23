import type { Company } from "@/lib/types";

type Props = {
  company: Company;
  recruiterNote: string;
  strengths: string[];
  gaps: string[];
};

export function CompanyFitCard({ company, recruiterNote, strengths, gaps }: Props) {
  return (
    <section className="ds-card col-span-full animate-fadeUp [animation-delay:75ms]">
      <div className="ds-card-label">Recruiter Note — {company}</div>
      <div className="mb-6 rounded-r-xl border-l-4 border-ink bg-ink/5 p-5 text-[14px] italic leading-relaxed text-ink/85">
        {recruiterNote}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-green">Company-Aligned</p>
          <ul className="space-y-1">
            {strengths.map((s) => (
              <li key={s} className="flex gap-2 text-[13px] text-ink/85">
                <span className="text-accent-green">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-red">Company Gaps</p>
          <ul className="space-y-1">
            {gaps.map((g) => (
              <li key={g} className="flex gap-2 text-[13px] text-ink/85">
                <span className="text-accent-red">✗</span> {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
