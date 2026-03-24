"use client";

import { useEffect, useState } from "react";
import { VerdictBanner } from "@/components/VerdictBanner";

type Props = {
  verdict: string;
  topPercentile: number;
  cultureFitScore: number;
  techFitScore: number;
  onRevealComplete?: () => void;
};

export function SlotMachineReveal({
  verdict,
  topPercentile,
  cultureFitScore,
  techFitScore,
  onRevealComplete
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [displayPercentile, setDisplayPercentile] = useState(0);

  useEffect(() => {
    let current = 0;
    const speed = 50;
    const startTime = Date.now();
    const duration = 2200;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      if (progress < 0.85) {
        current = Math.floor(Math.random() * 100);
      } else {
        current = Math.round(
          topPercentile * eased + (Math.random() * 4 - 2) * (1 - progress)
        );
      }
      current = Math.max(0, Math.min(99, current));
      setDisplayPercentile(current);

      if (progress < 1) {
        setTimeout(tick, speed + elapsed * 0.03);
      } else {
        setDisplayPercentile(topPercentile);
        setTimeout(() => {
          setRevealed(true);
          onRevealComplete?.();
        }, 600);
      }
    };

    tick();
  }, [topPercentile, onRevealComplete]);

  if (!revealed) {
    return (
      <div
        className="flex min-h-[280px] flex-col items-center justify-center px-8 py-16 text-center md:px-12 md:py-20"
        aria-live="polite"
      >
        <p className="mb-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[rgba(26,26,46,0.5)]">
          Calculating your fate…
        </p>
        <div
          className="font-display text-[5rem] font-extrabold leading-none tracking-tight text-ink md:text-[7rem]"
          style={{ minWidth: 120 }}
        >
          {String(displayPercentile).padStart(2, "0")}
        </div>
        <p className="mt-3 text-[13px] text-[rgba(26,26,46,0.5)]">
          percentile rank
        </p>
      </div>
    );
  }

  return (
    <VerdictBanner
      verdict={verdict}
      topPercentile={topPercentile}
      cultureFitScore={cultureFitScore}
      techFitScore={techFitScore}
    />
  );
}
