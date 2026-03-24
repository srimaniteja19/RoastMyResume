"use client";

import { motion } from "framer-motion";
import { companies, type AnalysisResult, type Company } from "@/lib/types";

type Props = {
  cache: Partial<Record<Company, AnalysisResult>>;
  onAnalyzeCompany?: (company: Company) => void;
  loadingCompany?: Company | null;
};

const VERDICT_STYLES: Record<string, string> = {
  SHORTLISTED: "bg-[rgba(0,200,83,0.12)] text-[#007a30]",
  "ON THE FENCE": "bg-[rgba(255,152,0,0.12)] text-[#c65d00]",
  REJECTED: "bg-[rgba(255,23,68,0.1)] text-[#b00020]"
};

export function CompanyComparisonView({
  cache,
  onAnalyzeCompany,
  loadingCompany
}: Props) {
  return (
    <div className="glass-card">
      <div className="card-eyebrow">All Companies — Comparison</div>
      <div className="mt-4 space-y-2">
        {companies.map((company) => {
          const d = cache[company];
          const loading = loadingCompany === company;
          const pct = d?.overall?.topPercentile ?? 0;
          const verdict = d?.overall?.verdict ?? null;
          const verdictClass = verdict ? (VERDICT_STYLES[verdict] ?? "bg-ink/10 text-ink/60") : "bg-ink/10 text-ink/40";

          return (
            <motion.div
              key={company}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 border-b border-[rgba(26,26,46,0.06)] py-3 last:border-b-0"
            >
              <div className="w-16 shrink-0 font-display text-[11px] font-bold tracking-wider text-ink/60">
                {company}
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(26,26,46,0.08)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #b388ff 0%, #e040fb 100%)" }}
                    initial={{ width: 0 }}
                    animate={{ width: d ? `${pct}%` : "0%" }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, duration: 1 }}
                  />
                </div>
              </div>
              <div className="w-10 shrink-0 text-right font-display text-xs font-bold text-ink">
                {d ? pct : "?"}
              </div>
              <div
                className={`w-24 shrink-0 rounded-full px-2 py-1 text-center text-[10px] font-bold ${verdictClass}`}
              >
                {verdict ? verdict.replace(/_/g, " ") : "—"}
              </div>
              {!d && onAnalyzeCompany && (
                <button
                  type="button"
                  onClick={() => onAnalyzeCompany(company)}
                  disabled={loading}
                  className="shrink-0 rounded-lg border border-ink/15 px-3 py-1.5 text-[11px] font-bold text-ink transition hover:border-[#b044ff] hover:text-[#b044ff] disabled:opacity-50"
                >
                  {loading ? "…" : "Analyze →"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
