"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Company } from "@/lib/types";

type Props = {
  headline: string;
  company: Company;
};

export function SuggestedHeadlineCard({ headline, company }: Props) {
  const [copied, setCopied] = useState(false);

  if (!headline?.trim()) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(headline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-4">
      <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-ink/50">
        Tailored headline for {company}
      </p>
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1 text-[14px] font-medium leading-snug text-ink">{headline}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
