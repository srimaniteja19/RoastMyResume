"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const MESSAGES = [
  ["🧠", "Simulating FAANG recruiter brain...", "WARMING UP THE ALGORITHM"],
  ["⚡", "Running gauntlet across 5 companies...", "RUNNING FAANG GAUNTLET"],
  ["🔍", "Measuring buzzword density...", "ANALYZING SIGNAL VS FLUFF"],
  ["📊", "Calculating your percentile rank...", "CROSS-REFERENCING CANDIDATE DB"],
  ["💀", "Identifying red flags...", "FLAGGING WEAK BULLETS"],
  ["✨", "Extracting power phrases...", "EXTRACTING HIRING SIGNALS"]
];

export function LoadingScreen() {
  const picks = useMemo(() => [...MESSAGES].sort(() => Math.random() - 0.5).slice(0, 6), []);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % picks.length);
      setProgress((p) => Math.min(p + Math.random() * 14 + 4, 88));
    }, 900);
    return () => clearInterval(t);
  }, [picks.length]);

  useEffect(() => {
    return () => setProgress(100);
  }, []);

  const [emoji, title, msg] = picks[idx] ?? picks[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 py-16 text-center">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-[3rem] animate-bounce"
      >
        {emoji}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] leading-tight text-ink"
      >
        {title}
      </motion.h2>
      <motion.p
        key={msg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 font-display text-xs font-bold uppercase tracking-[0.12em] text-[rgba(26,26,46,0.5)]"
      >
        {msg}
      </motion.p>
      <div className="mt-10 h-[3px] w-[280px] max-w-[90vw] overflow-hidden rounded-sm bg-[rgba(26,26,46,0.1)]">
        <motion.div
          className="h-full rounded-sm bg-ink"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
