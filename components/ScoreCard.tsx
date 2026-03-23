"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useMemo } from "react";
import type { Company } from "@/lib/types";

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h);
}

function pseudoRandom(seed: number, i: number) {
  const x = Math.sin(seed * 0.001 + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Counter({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) => Math.round(latest));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span>{rounded}</motion.span>;
}

type Props = {
  topPercentile: number;
  company: Company;
  cultureFitScore: number;
  techFitScore: number;
  overallScore: number;
};

export function ScoreCard({ topPercentile, company, cultureFitScore, techFitScore, overallScore }: Props) {
  const seed = useMemo(() => hashSeed(`${company}-${topPercentile}`), [company, topPercentile]);
  const activeIdx = Math.round((topPercentile / 100) * 19);

  const bars = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const pos = i / 19;
        const jitter = pseudoRandom(seed, i) * 20;
        const height = Math.max(10, Math.sin(pos * Math.PI) * 80 + 20 + jitter);
        return { height, active: i === activeIdx };
      }),
    [seed, activeIdx]
  );

  return (
    <section className="ds-card animate-fadeUp">
      <div className="ds-card-label">Overall Score</div>
      <p className="font-display text-5xl font-bold leading-none text-ink">
        <Counter value={overallScore} />
      </p>
      <p className="mb-2 mt-2 text-[13px] text-ink/55">
        Top <strong className="text-ink">{topPercentile}th percentile</strong> for {company} applicants
      </p>
      <div className="mb-6 flex h-12 items-end gap-1">
        {bars.map((b, i) => (
          <div
            key={i}
            className={`min-h-[4px] flex-1 rounded-sm transition-colors ${
              b.active ? "bg-ink" : "bg-ink/10"
            }`}
            style={{ height: `${b.height}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-ink/5 p-4">
          <p className="mb-1.5 text-[11px] text-ink/55">Culture Fit</p>
          <p className="font-display text-[1.75rem] font-bold text-accent-green">
            {cultureFitScore}
            <span className="text-base font-normal text-ink/50">/100</span>
          </p>
        </div>
        <div className="rounded-xl bg-ink/5 p-4">
          <p className="mb-1.5 text-[11px] text-ink/55">Tech Fit</p>
          <p className="font-display text-[1.75rem] font-bold text-accent">
            {techFitScore}
            <span className="text-base font-normal text-ink/50">/100</span>
          </p>
        </div>
      </div>
    </section>
  );
}
