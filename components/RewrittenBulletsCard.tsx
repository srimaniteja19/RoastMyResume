"use client";

import { Copy, Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RewrittenBullet } from "@/lib/types";

type Props = {
  bullets: RewrittenBullet[];
};

export function RewrittenBulletsCard({ bullets }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  if (bullets.length === 0) return null;

  async function handleCopy(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <section className="glass-card col-span-full">
      <div className="card-eyebrow">Before / After rewrite panel</div>
      <p className="mb-4 text-xs text-ink/55">
        Side-by-side diff. Copy the rewritten version to replace the original in your resume.
      </p>
      <div className="space-y-3">
        {bullets.map((b, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{ height: "auto" }}
              className="overflow-hidden rounded-xl border border-ink/10 bg-white/80"
            >
              <button
                type="button"
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-ink/5"
              >
                <span className="text-[11px] font-bold uppercase text-ink/50">Bullet #{i + 1}</span>
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  className="text-ink/40"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-ink/10"
                  >
                  {/* Before | After side-by-side */}
                  <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                    <div className="border-b border-ink/5 p-4 md:border-b-0 md:border-r">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink/40">
                        Original
                      </p>
                      <p className="text-[13px] leading-relaxed text-ink/60 line-through">
                        {b.original}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#00703a]">
                          Rewritten
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopy(b.rewritten, i)}
                          className="flex items-center gap-1.5 rounded-lg border border-ink/15 px-2.5 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:bg-ink/5 hover:border-[#e040fb]/30"
                        >
                          {copiedIdx === i ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#00c853]" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-medium text-[14px] leading-relaxed text-ink">
                        {b.rewritten}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-ink/5 bg-ink/[0.02] px-4 py-3">
                    <p className="text-[11px] text-ink/55">
                      <span className="font-semibold text-ink/70">Improvement:</span> {b.improvement}
                    </p>
                  </div>
                </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
