"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { DownloadProgress } from "@/components/DownloadProgress";
import { FormatPicker } from "@/components/FormatPicker";
import { PrintResume } from "@/components/PrintResume";
import type { AnalysisResult } from "@/lib/types";
import type {
  DownloadFormat,
  DownloadOptions,
  ParsedResume,
  ResumeAnalysis
} from "@/lib/types/resume";

function toResumeAnalysis(result: AnalysisResult): ResumeAnalysis {
  return {
    verdict: result.overall.verdict,
    percentile: result.overall.topPercentile,
    weakPhrases: (result.phrases?.weakPhrases ?? []).map((p) =>
      typeof p === "string" ? p : p.phrase
    ),
    strongPhrases: (result.phrases?.strongPhrases ?? []).map((p) =>
      typeof p === "string" ? p : p.phrase
    ),
    improvements: (result.improvements ?? []).map((i) => ({
      priority: i.priority,
      issue: i.issue,
      fix: i.fix
    }))
  };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  resumeText: string;
  analysis: AnalysisResult;
  targetCompany: string;
  apiKey?: string;
  provider?: "anthropic" | "openai" | "gemini";
};

export function DownloadModal({
  isOpen,
  onClose,
  resumeText,
  analysis,
  targetCompany,
  apiKey,
  provider
}: Props) {
  const [format, setFormat] = useState<DownloadFormat>("docx");
  const [options, setOptions] = useState<DownloadOptions>({
    applyRewrites: true,
    highlightStrong: true,
    rewriteSummary: false
  });
  const [phase, setPhase] = useState<"picker" | "progress" | "done" | "error">("picker");
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [printResume, setPrintResume] = useState<ParsedResume | null>(null);

  const resumeAnalysis = toResumeAnalysis(analysis);

  const apiBody = () => ({
    ...(apiKey && { apiKey }),
    ...(provider && { provider })
  });

  async function generateResume() {
    setPhase("progress");
    setErrorMessage("");

    try {
      setCurrentStep(1);
      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, ...apiBody() })
      });
      if (!parseRes.ok) {
        const err = await parseRes.json().catch(() => ({}));
        throw new Error(err?.error ?? "Parse failed");
      }
      let parsed: ParsedResume = (await parseRes.json()).parsed;

      setCurrentStep(2);
      if (options.applyRewrites) {
        const rewriteRes = await fetch("/api/rewrite-bullets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: parsed,
            analysis: resumeAnalysis,
            targetCompany,
            ...apiBody()
          })
        });
        if (!rewriteRes.ok) {
          const err = await rewriteRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Rewrite failed");
        }
        parsed = (await rewriteRes.json()).resume;
      }

      setCurrentStep(3);
      if (options.rewriteSummary && parsed.summary) {
        const summRes = await fetch("/api/rewrite-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: parsed.summary,
            targetCompany,
            resume: parsed,
            ...apiBody()
          })
        });
        if (!summRes.ok) {
          const err = await summRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Summary rewrite failed");
        }
        parsed = { ...parsed, summary: (await summRes.json()).summary };
      }

      setCurrentStep(4);
      if (format === "docx") {
        const docRes = await fetch("/api/generate-docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: parsed,
            options,
            analysis: resumeAnalysis
          })
        });
        if (!docRes.ok) {
          const err = await docRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "DOCX generation failed");
        }
        const blob = await docRes.blob();
        setCurrentStep(5);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(parsed.name || "resume").replace(/[^a-zA-Z0-9_-]/g, "_")}_updated.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setPrintResume(parsed);
        setCurrentStep(5);
        await new Promise((r) => setTimeout(r, 300));
        window.print();
      }

      setPhase("done");
      setTimeout(onClose, 2000);
    } catch (err) {
      setPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  function handleClose() {
    if (phase === "progress") return;
    setPhase("picker");
    setCurrentStep(1);
    setErrorMessage("");
    setPrintResume(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,20,40,0.6)] p-4 backdrop-blur-[6px]"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-[440px] rounded-[20px] bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.2)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Download Updated Resume</h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={phase === "progress"}
              className="rounded-full p-2 text-ink/50 transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {phase === "picker" && (
            <>
              <FormatPicker
                format={format}
                options={options}
                onFormatChange={setFormat}
                onOptionsChange={(o) => setOptions((prev) => ({ ...prev, ...o }))}
              />
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => void generateResume()}
                  className="flex-1 rounded-xl py-3 font-display text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
                >
                  Generate & Download
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-ink/20 px-5 py-3 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {phase === "progress" && (
            <DownloadProgress currentStep={currentStep} />
          )}

          {phase === "done" && (
            <p className="text-center text-[15px] font-medium text-[#00703a]">
              ✓ Download complete!
            </p>
          )}

          {phase === "error" && (
            <div className="space-y-4">
              <p className="text-[14px] text-[#c0001a]">⚠ {errorMessage}</p>
              <p className="text-[12px] text-ink/60">
                Make sure ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY is set in .env.local,
                or that your API key is valid.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPhase("picker");
                  setCurrentStep(1);
                }}
                className="rounded-xl border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(<PrintResume resume={printResume} />, document.body)}
    </>
  );
}
