"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { RewrittenBullet } from "@/lib/types";

type Props = {
  bullets: RewrittenBullet[];
};

export function RewrittenBulletsCard({ bullets }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (bullets.length === 0) return null;

  async function handleCopy(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <section className="glass-card col-span-full">
      <div className="card-eyebrow">Copy-Paste Bullet Rewrites</div>
      <p className="mb-4 text-xs text-ink/55">
        Drop these into your resume — replace the originals. Add your real numbers where [ESTIMATED] appears.
      </p>
      <div className="space-y-5">
        {bullets.map((b, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-white/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase text-ink/50">Original</span>
              <span className="text-[10px] text-ink/40">#{i + 1}</span>
            </div>
            <p className="mb-4 line-through text-[13px] text-ink/60">{b.original}</p>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase text-[#00703a]">Rewritten</span>
              <button
                type="button"
                onClick={() => handleCopy(b.rewritten, i)}
                className="flex items-center gap-1.5 rounded-lg border border-ink/15 px-2.5 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:bg-ink/5"
              >
                {copiedIdx === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
            </div>
            <p className="mb-2 font-medium text-[14px] text-ink">{b.rewritten}</p>
            <p className="text-[12px] text-ink/55">{b.improvement}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
