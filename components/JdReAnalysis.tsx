"use client";

import { FileSearch, Loader2 } from "lucide-react";
import { useState } from "react";
import { analyzeResumeAgainstJD } from "@/lib/ai";
import type { ApiProvider, Company } from "@/lib/types";

type Props = {
  company: Company;
  resumeText: string;
  provider: ApiProvider;
  apiKey: string;
};

export function JdReAnalysis({ company, resumeText, provider, apiKey }: Props) {
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    jdAlignmentScore: number;
    keywordGaps: string[];
    keywordsMatched: string[];
    tailoredSummary: string;
    suggestedAdditions: string[];
  } | null>(null);

  async function fetchJdFromUrl(url: string): Promise<string> {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.text();
  }

  async function handleFetchUrl() {
    const url = jdUrl.trim();
    if (!url) return;

    setError("");
    try {
      const text = await fetchJdFromUrl(url);
      setJdText((prev) => (prev ? `${prev}\n\n---\n\n${text}` : text));
      setJdUrl("");
    } catch {
      setError(
        "Couldn't fetch this URL (likely CORS). Paste the JD text directly in the box below."
      );
    }
  }

  async function handleAnalyze() {
    const text = jdText.trim();
    if (!text || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const analysis = await analyzeResumeAgainstJD(
        provider,
        apiKey,
        company,
        resumeText,
        text
      );
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-card">
      <div className="card-eyebrow">JD-specific re-analysis</div>
      <p className="mb-4 text-xs text-ink/55">
        Paste a job description (or URL) to see how your resume stacks up for that specific role.
      </p>

      <div className="mb-4 flex gap-2">
        <input
          type="url"
          value={jdUrl}
          onChange={(e) => setJdUrl(e.target.value)}
          placeholder="Optional: paste JD URL (may not work due to CORS)"
          className="min-w-0 flex-1 rounded-xl border-[1.5px] border-ink/15 bg-white px-4 py-2.5 text-[13px] text-ink outline-none transition focus:border-[#b044ff]"
        />
        <button
          type="button"
          onClick={() => void handleFetchUrl()}
          disabled={!jdUrl.trim()}
          className="shrink-0 rounded-xl border-[1.5px] border-ink/20 px-4 py-2.5 text-[13px] font-medium text-ink transition hover:border-[#b044ff] hover:text-[#b044ff] disabled:opacity-50"
        >
          Fetch
        </button>
      </div>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste the full job description here…"
        rows={5}
        className="mb-4 w-full resize-y rounded-xl border-[1.5px] border-ink/15 bg-white px-4 py-3 text-[13px] text-ink outline-none transition focus:border-[#b044ff]"
      />

      {error ? (
        <p className="mb-4 text-[12px] text-[#c0001a]">⚠ {error}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleAnalyze()}
        disabled={!jdText.trim() || loading}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white transition disabled:opacity-50"
        style={{
          background:
            jdText.trim() && !loading
              ? "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)"
              : "rgba(26,26,46,0.2)"
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSearch className="h-4 w-4" />
        )}
        {loading ? "Analyzing…" : "Analyze against this JD"}
      </button>

      {result ? (
        <div className="mt-6 space-y-4 border-t border-[rgba(26,26,46,0.08)] pt-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[rgba(176,68,255,0.12)] px-4 py-2">
              <span className="font-display text-2xl font-extrabold text-[#b044ff]">
                {result.jdAlignmentScore}
              </span>
              <span className="ml-1 text-[13px] text-ink/60">/100 alignment</span>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
              Tailored summary
            </h4>
            <p className="text-[13px] leading-relaxed text-ink">{result.tailoredSummary}</p>
          </div>

          {result.keywordsMatched.length > 0 ? (
            <div>
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#00703a]">
                Matched keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keywordsMatched.map((k) => (
                  <span
                    key={k}
                    className="rounded-md bg-[rgba(0,200,83,0.15)] px-2.5 py-1 text-[11.5px] font-mono text-[#00703a]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {result.keywordGaps.length > 0 ? (
            <div>
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#c0001a]">
                Keyword gaps
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keywordGaps.map((k) => (
                  <span
                    key={k}
                    className="rounded-md bg-[rgba(255,23,68,0.12)] px-2.5 py-1 text-[11.5px] font-mono text-[#c0001a]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {result.suggestedAdditions.length > 0 ? (
            <div>
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                Suggested additions
              </h4>
              <ul className="space-y-1.5">
                {result.suggestedAdditions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-ink">
                    <span className="text-[#b044ff]">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
