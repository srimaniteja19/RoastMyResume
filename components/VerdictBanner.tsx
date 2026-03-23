"use client";

import { motion } from "framer-motion";

function verdictClass(verdict: string) {
  if (verdict === "REJECTED") return "verdict-chrome rejected";
  if (verdict === "ON THE FENCE") return "verdict-chrome fence";
  if (verdict === "SHORTLISTED") return "verdict-chrome shortlisted";
  return "verdict-chrome";
}

function formatVerdict(verdict: string) {
  return verdict.replace(/_/g, " ");
}

type Props = {
  verdict: string;
  topPercentile?: number;
  cultureFitScore?: number;
  techFitScore?: number;
};

export function VerdictBanner({ verdict, topPercentile, cultureFitScore, techFitScore }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className="px-8 py-16 text-center md:px-12 md:py-20"
    >
      <p className="mb-5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[rgba(26,26,46,0.5)]">
        Your resume is getting
      </p>
      <span className={verdictClass(verdict)}>{formatVerdict(verdict)}</span>
      {(topPercentile != null || cultureFitScore != null || techFitScore != null) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {topPercentile != null && (
            <span className="rounded-full border-[1.5px] border-white/90 bg-white/70 px-5 py-2 font-display text-[13px] font-bold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md">
              {topPercentile}th percentile
            </span>
          )}
          {cultureFitScore != null && (
            <span className="rounded-full border-[1.5px] border-white/90 bg-white/70 px-5 py-2 font-display text-[13px] font-bold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md">
              Culture {cultureFitScore}/100
            </span>
          )}
          {techFitScore != null && (
            <span className="rounded-full border-[1.5px] border-white/90 bg-white/70 px-5 py-2 font-display text-[13px] font-bold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md">
              Tech {techFitScore}/100
            </span>
          )}
        </div>
      )}
    </motion.section>
  );
}
