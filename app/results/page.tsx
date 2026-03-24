"use client";

import { toPng } from "html-to-image";

export const dynamic = "force-dynamic";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompanyComparisonView } from "@/components/CompanyComparisonView";
import { CompanyTabs, type TabValue } from "@/components/CompanyTabs";
import { ExecutiveSummaryCard } from "@/components/ExecutiveSummaryCard";
import { KeywordsCard } from "@/components/KeywordsCard";
import { ImprovementPlaybookCard } from "@/components/ImprovementPlaybookCard";
import { InterviewQuestionsCard } from "@/components/InterviewQuestionsCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { OneLinerPitchCard } from "@/components/OneLinerPitchCard";
import { PdfOverlay } from "@/components/PdfOverlay";
import { RadarChart } from "@/components/RadarChart";
import { RecruiterSimulation } from "@/components/RecruiterSimulation";
import { ShareableVerdictCard } from "@/components/ShareableVerdictCard";
import { RewrittenBulletsCard } from "@/components/RewrittenBulletsCard";
import { ResultsSkeleton } from "@/components/ResultsSkeleton";
import { SuggestedHeadlineCard } from "@/components/SuggestedHeadlineCard";
import { TopActionsCard } from "@/components/TopActionsCard";
import { SlotMachineReveal } from "@/components/SlotMachineReveal";
import { VerdictBanner } from "@/components/VerdictBanner";
import { ATSParsePreview } from "@/components/ATSParsePreview";
import { AskRecruiterChat } from "@/components/AskRecruiterChat";
import { DownloadModal } from "@/components/DownloadModal";
import { JdReAnalysis } from "@/components/JdReAnalysis";
import { analyzeResume } from "@/lib/ai";
import { companies, type AnalysisResult, type ApiProvider, type Company } from "@/lib/types";

const SESSION_API_KEY = "rmr_api_key";
const SESSION_PROVIDER = "rmr_provider";
const SESSION_RESUME_TEXT = "rmr_resume_text";
const SESSION_CACHE = "rmr_results_cache_v3";

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1100, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

export default function ResultsPage() {
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [provider, setProvider] = useState<ApiProvider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [tab, setTab] = useState<TabValue>(companies[0]);
  const [loading, setLoading] = useState(false);
  const [analyzeTarget, setAnalyzeTarget] = useState<Company | null>(null);
  const [error, setError] = useState("");
  const [cache, setCache] = useState<Partial<Record<Company, AnalysisResult>>>({});

  const company = tab === "__compare" ? (companies.find((c) => cache[c]) ?? companies[0]) : tab;
  const displayResult = cache[company];

  useEffect(() => {
    setApiKey(sessionStorage.getItem(SESSION_API_KEY) ?? "");
    setProvider((sessionStorage.getItem(SESSION_PROVIDER) as ApiProvider) ?? "anthropic");
    setResumeText(sessionStorage.getItem(SESSION_RESUME_TEXT) ?? "");
    const rawCache = sessionStorage.getItem(SESSION_CACHE);
    if (rawCache) {
      try {
        const parsed = JSON.parse(rawCache);
        if (parsed && typeof parsed === "object") setCache(parsed);
      } catch {
        setCache({});
      }
    }
  }, []);

  const result = displayResult;
  const cacheCount = Object.keys(cache).length;
  const companyToAnalyze = tab !== "__compare" && !cache[tab] ? tab : analyzeTarget;
  const isFirstLoad = loading && !result && cacheCount === 0;
  const isTabLoading = loading && companyToAnalyze != null;
  const needsSession = !resumeText || !apiKey;
  const hasResult = result && "overall" in result;

  useEffect(() => {
    if (!apiKey || !resumeText || !companyToAnalyze || cache[companyToAnalyze]) return;
    setLoading(true);
    setError("");
    analyzeResume(provider, apiKey, companyToAnalyze, resumeText)
      .then((next) => {
        setCache((prev) => {
          const updated = { ...prev, [companyToAnalyze]: next };
          sessionStorage.setItem(SESSION_CACHE, JSON.stringify(updated));
          return updated;
        });
        setAnalyzeTarget(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "The algorithm choked. Try again.");
      })
      .finally(() => setLoading(false));
  }, [provider, apiKey, resumeText, companyToAnalyze, cache]);

  const verdictCardRef = useRef<HTMLDivElement>(null);
  const [slotRevealed, setSlotRevealed] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  async function shareCard() {
    const target = verdictCardRef.current;
    if (!target || !result) return;
    const dataUrl = await toPng(target, {
      width: 1200,
      height: 630,
      pixelRatio: 2,
      backgroundColor: "#e8f3fd"
    });
    const a = document.createElement("a");
    a.download = `roast-${company.toLowerCase()}-${result.overall.topPercentile}pct.png`;
    a.href = dataUrl;
    a.click();
  }

  function clearCompanyCache(co?: Company) {
    const target = co ?? (tab !== "__compare" ? tab : companyToAnalyze);
    if (!target) return;
    setCache((prev) => {
      const next = { ...prev };
      delete next[target];
      sessionStorage.setItem(SESSION_CACHE, JSON.stringify(next));
      return next;
    });
  }

  if (isFirstLoad) return <LoadingScreen />;

  return (
    <div className="min-h-screen pb-16">
      {/* Pink/lavender glow overlay */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,64,251,0.12) 0%, rgba(176,68,255,0.06) 50%, transparent 70%)"
        }}
      />
      {/* Results nav — roast-v2 */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between border-b border-white/50 px-8 py-4 backdrop-blur-xl md:px-12"
        style={{ background: "rgba(184,212,245,0.8)" }}
      >
        <div className="font-display text-sm font-bold tracking-wide text-ink/70">
          RoastMyResume
        </div>
        <div className="flex items-center gap-2">
          {hasResult && result && !isTabLoading && (
            <>
              <button
                type="button"
                onClick={() => setDownloadModalOpen(true)}
                className="flex items-center gap-2 rounded-full border-[1.5px] border-ink/20 bg-white/50 px-[18px] py-[7px] text-xs font-medium text-ink backdrop-blur-md transition hover:border-ink/35 hover:bg-white/80"
              >
                <Download className="h-4 w-4" />
                Download Updated
              </button>
              <button
                type="button"
                onClick={() => void shareCard()}
                className="flex items-center gap-2 rounded-full border-[1.5px] border-ink/20 bg-white/50 px-[18px] py-[7px] text-xs font-medium text-ink backdrop-blur-md transition hover:border-ink/35 hover:bg-white/80"
              >
                <Download className="h-4 w-4" />
                Share
              </button>
            </>
          )}
          <Link
            href="/"
            className="rounded-full border-[1.5px] border-ink/20 bg-white/50 px-[18px] py-[7px] text-xs font-medium text-ink backdrop-blur-md transition hover:border-ink/35 hover:bg-white/80"
          >
            ↩ New Resume
          </Link>
        </div>
      </nav>

      {error && !isFirstLoad ? (
        <div className="mx-8 my-6 md:mx-12">
          <div className="rounded-xl border border-[rgba(255,23,68,0.25)] bg-[rgba(255,23,68,0.08)] px-5 py-3.5 text-[13px] text-[#c0001a]">
            ⚠ {error}{" "}
            <button
              type="button"
              className="ml-2 font-semibold underline"
              onClick={() => {
                setError("");
                clearCompanyCache();
              }}
            >
              try again
            </button>
          </div>
        </div>
      ) : null}

      {hasResult && result ? (
        slotRevealed ? (
          <VerdictBanner
            verdict={result.overall.verdict}
            topPercentile={result.overall.topPercentile}
            cultureFitScore={result.companyFit.cultureFitScore}
            techFitScore={result.companyFit.techFitScore}
          />
        ) : (
          <SlotMachineReveal
            verdict={result.overall.verdict}
            topPercentile={result.overall.topPercentile}
            cultureFitScore={result.companyFit.cultureFitScore}
            techFitScore={result.companyFit.techFitScore}
            onRevealComplete={() => setSlotRevealed(true)}
          />
        )
      ) : null}

      {isTabLoading ? (
        <div
          className="px-8 py-12 text-center md:px-12"
          style={{ background: "rgba(184,212,245,0.5)" }}
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[rgba(26,26,46,0.5)]">
            Recruiter Verdict
          </p>
          <p className="mt-4 font-display text-4xl text-ink/40 md:text-5xl">Analyzing…</p>
        </div>
      ) : null}

      {!needsSession ? (
        <CompanyTabs
          value={tab}
          onChange={setTab}
          loadingCompany={isTabLoading && companyToAnalyze ? companyToAnalyze : null}
        />
      ) : null}

      <div ref={captureRef}>
        {isTabLoading ? (
          <ResultsSkeleton />
        ) : needsSession ? (
          <section className="mx-auto max-w-[1120px] px-8 py-16 md:px-12">
            <div className="glass-card rounded-2xl p-6">
              <p className="text-[15px] text-[rgba(26,26,46,0.6)]">
                Upload a resume and API key on the landing page to begin.
              </p>
              <Link href="/" className="mt-4 inline-block text-sm font-semibold text-ink underline">
                ← Back home
              </Link>
            </div>
          </section>
        ) : tab === "__compare" ? (
          <div className="mx-auto max-w-[1120px] px-8 py-10 md:px-12">
            <CompanyComparisonView
              cache={cache}
              onAnalyzeCompany={(co) => setAnalyzeTarget(co)}
              loadingCompany={isTabLoading ? companyToAnalyze ?? undefined : undefined}
            />
          </div>
        ) : hasResult && result ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-[1120px] px-8 py-10 md:px-12"
            >
              <RoastV2Results
                result={result}
                company={tab}
                resumeText={resumeText}
                provider={provider}
                apiKey={apiKey}
              />
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>

      {hasResult && result && !isTabLoading ? (
        <div className="mx-auto max-w-[1120px] px-8 pb-8 md:px-12">
          <button
            type="button"
            className="rounded-full border-[1.5px] border-ink/20 bg-white/50 px-[18px] py-[7px] text-xs font-medium text-ink backdrop-blur-md transition hover:border-ink/35 hover:bg-white/80"
            onClick={() => void shareCard()}
          >
            <Download className="mr-1.5 inline h-4 w-4" />
            Share Verdict Card
          </button>
        </div>
      ) : null}

      {result && (
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          resumeText={resumeText}
          analysis={result}
          targetCompany={company}
          apiKey={apiKey || undefined}
          provider={provider}
        />
      )}

      {/* Hidden shareable card for PNG capture (1200x630) */}
      {hasResult && result && (
        <div
          ref={verdictCardRef}
          className="fixed left-[-9999px] top-0"
          aria-hidden
        >
          <ShareableVerdictCard result={result} company={company} />
        </div>
      )}
    </div>
  );
}

function RoastV2Results({
  result,
  company,
  resumeText,
  provider,
  apiKey
}: {
  result: AnalysisResult;
  company: Company;
  resumeText: string;
  provider: ApiProvider;
  apiKey: string;
}) {
  const d = result;
  const activeIdx = Math.min(23, Math.round((d.overall.topPercentile / 100) * 23));
  const bars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const x = i / 23;
        const h = Math.max(8, (Math.sin(x * Math.PI) * 0.7 + 0.15 + Math.random() * 0.15) * 100);
        return { height: h, active: i === activeIdx };
      }),
    [activeIdx]
  );

  const strengths = [...d.companyFit.companySpecificStrengths, ...d.recruiterEye.greenFlags].slice(0, 4);
  const weaknesses = [...d.companyFit.companySpecificGaps, ...d.recruiterEye.redFlags].slice(0, 4);
  const strongPhrases = d.phrases.strongPhrases;
  const weakPhrases = d.phrases.weakPhrases;
  const strongPhraseStrings = strongPhrases.map((p) => (typeof p === "string" ? p : p.phrase));
  const weakPhraseStrings = weakPhrases.map((p) => (typeof p === "string" ? p : p.phrase));

  return (
    <>
      {/* Recruiter 7s simulation — must be near top for PDF to render */}
      <div className="mb-5">
        <div className="glass-card flex flex-col py-6" style={{ animationDelay: "0.26s" }}>
          <div className="card-eyebrow">Recruiter time simulation</div>
          <div className="mb-4 text-xs text-ink/55">
            A recruiter spends ~7 seconds on your resume. Watch what they notice, second by second.
          </div>
          <RecruiterSimulation verdict={result.overall.verdict} />
        </div>
      </div>

      {/* Radar chart — morphs per company */}
      <div className="mb-5">
        <motion.div
          key={company}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-col items-center py-6"
        >
          <div className="card-eyebrow mb-2">Your profile at {company}</div>
          <p className="mb-4 text-center text-[12px] text-ink/55">
            Switch company tabs to see how your scores morph
          </p>
          <RadarChart result={d} />
        </motion.div>
      </div>

      {/* Row 1: Score + Notes + Keywords */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="glass-card" style={{ animationDelay: "0.05s" }}>
          <div className="card-eyebrow">Percentile Rank · {company}</div>
          <div className="font-display text-[5.5rem] font-extrabold leading-none text-ink">
            <AnimatedCounter value={d.overall.topPercentile} />
          </div>
          <div className="mb-5 text-[13px] text-[rgba(26,26,46,0.5)]">
            Top <strong className="text-ink">{d.overall.topPercentile}th percentile</strong> among{" "}
            {company} applicants
          </div>
          <div className="mb-5 flex h-11 items-end gap-0.5">
            {bars.map((b, i) => (
              <div
                key={i}
                className={`min-h-[3px] flex-1 rounded-t-sm transition-colors ${
                  b.active ? "bg-[#b044ff]" : "bg-[rgba(26,26,46,0.1)]"
                }`}
                style={{ height: `${b.height}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[rgba(26,26,46,0.04)] p-3">
              <div className="mb-1 text-[11px] text-[rgba(26,26,46,0.5)]">Culture Fit</div>
              <div className="font-display text-[1.8rem] font-extrabold text-ink">
                {d.companyFit.cultureFitScore}
                <span className="text-[13px] font-normal text-[rgba(26,26,46,0.5)]">/100</span>
              </div>
            </div>
            <div className="rounded-xl bg-[rgba(26,26,46,0.04)] p-3">
              <div className="mb-1 text-[11px] text-[rgba(26,26,46,0.5)]">Tech Skills</div>
              <div className="font-display text-[1.8rem] font-extrabold text-ink">
                {d.companyFit.techFitScore}
                <span className="text-[13px] font-normal text-[rgba(26,26,46,0.5)]">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ animationDelay: "0.1s" }}>
          <div className="card-eyebrow">Candidate Notes</div>
          <div className="flex flex-col">
            {strengths.map((s) => (
              <div key={s} className="flex items-start gap-2.5 border-b border-[rgba(26,26,46,0.07)] py-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[rgba(0,200,83,0.15)] text-[11px] font-bold text-[#00c853]">
                  ✓
                </div>
                <span className="text-[13px] leading-relaxed text-ink2">{s}</span>
              </div>
            ))}
            {weaknesses.map((w) => (
              <div key={w} className="flex items-start gap-2.5 border-b border-[rgba(26,26,46,0.07)] py-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[rgba(255,23,68,0.12)] text-[11px] font-bold text-[#ff1744]">
                  ✗
                </div>
                <span className="text-[13px] leading-relaxed text-ink2">{w}</span>
              </div>
            ))}
          </div>
        </div>

        <KeywordsCard
          present={d.ats.keywordsPresent}
          missing={d.ats.keywordsMissing}
          company={company}
        />
      </div>

      {/* Recruiter note + Executive summary */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="glass-card" style={{ animationDelay: "0.15s" }}>
          <div className="card-eyebrow">How {company} recruiters see you</div>
          <div className="rounded-r-xl border-l-4 border-ink bg-[rgba(26,26,46,0.03)] p-5 text-[14px] italic leading-relaxed text-ink2">
            {d.companyFit.recruiterNote}
          </div>
        </div>
        <ExecutiveSummaryCard summary={d.overall.executiveSummary} />
      </div>

      {/* One-liner pitch + Suggested headline + Top actions */}
      {(d.oneLinerPitch || d.suggestedHeadline || (d.topActions?.length ?? 0) > 0) ? (
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {d.oneLinerPitch ? (
            <div className="md:col-span-2">
              <OneLinerPitchCard pitch={d.oneLinerPitch} />
            </div>
          ) : null}
          <div className="space-y-5">
            {d.suggestedHeadline ? (
              <SuggestedHeadlineCard headline={d.suggestedHeadline} company={company} />
            ) : null}
            {d.topActions?.length ? (
              <TopActionsCard actions={d.topActions} />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Words that hire + Red flags — roast-v2 two-phrases */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div
          className="rounded-2xl border-[1.5px] border-[rgba(150,220,180,0.8)] bg-[rgba(200,240,215,0.7)] p-6"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex gap-3.5">
            <div>
              <div className="font-display text-2xl font-extrabold leading-tight text-[#00703a]">
                Words that
                <br />
                Hire you
              </div>
              <div className="mt-1.5 text-xs leading-relaxed text-[rgba(0,80,40,0.65)]">
                These are most
                <br />
                deciding words about you
              </div>
            </div>
            <div className="min-w-0 flex-1 rounded-xl bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.1)]">
              <div className="mb-2 h-[7px] w-1/2 rounded bg-[#ddd]" />
              {strongPhraseStrings.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className={`mb-1.5 h-[5px] rounded-sm ${
                    i < 2 ? "bg-[rgba(0,200,83,0.35)]" : "bg-[#eee]"
                  } ${i === 0 ? "w-full" : i === 1 ? "w-4/5" : "w-[65%]"}`}
                />
              ))}
              <div className="my-2 h-[5px] w-2/5 rounded bg-[#eee]" />
              {strongPhraseStrings.slice(3, 6).map((_, i) => (
                <div
                  key={i}
                  className={`mb-1.5 h-[5px] rounded-sm ${
                    i === 0 || i === 2 ? "bg-[rgba(0,200,83,0.35)]" : "bg-[#eee]"
                  } ${i === 0 ? "w-full" : i === 1 ? "w-4/5" : "w-[65%]"}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {strongPhraseStrings.map((p) => (
              <span key={p} className="ptag g rounded-md px-2.5 py-1 text-[11.5px] font-mono">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border-[1.5px] border-[rgba(255,170,170,0.8)] bg-[rgba(255,220,220,0.7)] p-6"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex gap-3.5">
            <div>
              <div className="font-display text-2xl font-extrabold leading-tight text-[#c0001a]">
                Red Flags that
                <br />
                Hurt you
              </div>
              <div className="mt-1.5 text-xs leading-relaxed text-[rgba(150,0,20,0.6)]">
                Stuff that screams
                <br />
                &apos;next applicant.&apos;
              </div>
            </div>
            <div className="min-w-0 flex-1 rounded-xl bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.1)]">
              <div className="mb-2 h-[7px] w-1/2 rounded bg-[#ddd] line-through" />
              {weakPhraseStrings.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className={`mb-1.5 h-[5px] rounded-sm ${
                    i < 2 ? "bg-[rgba(255,23,68,0.25)] line-through" : "bg-[#eee]"
                  } ${i === 0 ? "w-full" : i === 1 ? "w-4/5" : "w-[65%]"}`}
                />
              ))}
              <div className="my-2 h-[5px] w-2/5 rounded bg-[#eee]" />
              {weakPhraseStrings.slice(3, 6).map((_, i) => (
                <div
                  key={i}
                  className={`mb-1.5 h-[5px] rounded-sm ${
                    i === 0 || i === 2 ? "bg-[rgba(255,23,68,0.25)] line-through" : "bg-[#eee]"
                  } ${i === 0 ? "w-full" : i === 1 ? "w-4/5" : "w-[65%]"}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {weakPhraseStrings.map((p) => (
              <span key={p} className="ptag r rounded-md px-2.5 py-1 text-[11.5px] font-mono">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ATS Parse Preview */}
      <div className="mb-5" style={{ animationDelay: "0.28s" }}>
        <ATSParsePreview resumeText={resumeText} result={result} />
      </div>

      {/* PDF Highlights — roast-v2 */}
      <div className="glass-card mb-5 col-span-full" style={{ animationDelay: "0.3s" }}>
        <div className="card-eyebrow">Resume Highlights — What sticks in the blink</div>
        <div className="mb-4 text-xs text-[rgba(26,26,46,0.5)]">
          <span className="rounded bg-[rgba(0,200,83,0.2)] px-1.5 py-0.5 text-[#00703a]">Green</span> = strong,{" "}
          <span className="rounded bg-[rgba(255,23,68,0.15)] px-1.5 py-0.5 text-[#c0001a]">Red</span> = hurts you.
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          <PdfOverlay strongPhrases={strongPhrases} weakPhrases={weakPhrases} />
        </div>
      </div>

      {/* Rewritten bullets — copy-paste ready */}
      {d.rewrittenBullets?.length ? (
        <div className="mb-5" style={{ animationDelay: "0.33s" }}>
          <RewrittenBulletsCard bullets={d.rewrittenBullets} />
        </div>
      ) : null}

      {/* Interview questions + Improvements */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {d.interviewQuestions?.length ? (
          <InterviewQuestionsCard questions={d.interviewQuestions} company={company} />
        ) : null}
        <div className={d.interviewQuestions?.length ? "" : "md:col-span-2"}>
          <ImprovementPlaybookCard
            improvements={d.improvements}
            initialScore={d.overall.overallScore}
          />
        </div>
      </div>

      {/* Ask the recruiter + JD re-analysis — retention features */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <AskRecruiterChat
          result={result}
          company={company}
          resumeText={resumeText}
          provider={provider}
          apiKey={apiKey}
        />
        <JdReAnalysis
          company={company}
          resumeText={resumeText}
          provider={provider}
          apiKey={apiKey}
        />
      </div>
    </>
  );
}
