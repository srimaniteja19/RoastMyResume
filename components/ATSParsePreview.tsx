"use client";

import type { AnalysisResult } from "@/lib/types";

const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  projects: "Projects",
  contact: "Contact Info"
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Props = {
  resumeText: string;
  result: AnalysisResult;
};

export function ATSParsePreview({ resumeText, result }: Props) {
  const rawText = resumeText.slice(0, 400).replace(/</g, "&lt;");
  const strongPhrases = result.phrases?.strongPhrases?.map((p) => (typeof p === "string" ? p : p.phrase)) ?? [];
  const weakPhrases = result.phrases?.weakPhrases?.map((p) => (typeof p === "string" ? p : p.phrase)) ?? [];
  const sections = result.ats?.sectionCompleteness ?? {};

  let highlighted = rawText;
  strongPhrases.forEach((p) => {
    if (p.length >= 3) {
      const re = new RegExp(escapeRegex(p), "gi");
      highlighted = highlighted.replace(re, (m) => `<span class="ats-keyword-found">${m}</span>`);
    }
  });
  weakPhrases.forEach((p) => {
    if (p.length >= 3) {
      const re = new RegExp(escapeRegex(p), "gi");
      highlighted = highlighted.replace(re, (m) => `<span class="ats-keyword-miss">${m}</span>`);
    }
  });

  const sectionRows = Object.entries(sections).length > 0
    ? Object.entries(sections).map(([key, found]) => ({
        name: SECTION_LABELS[key] ?? key,
        found: !!found
      }))
    : [
        { name: "Contact Info", found: /contact|email|phone|@/i.test(resumeText) },
        { name: "Experience", found: /experience|work|employment|\.\d{4}/i.test(resumeText) },
        { name: "Skills", found: /skills|technical|proficient|expertise/i.test(resumeText) },
        { name: "Education", found: /education|university|degree|b\.?s\.?|m\.?s\.?|b\.?a\.?/i.test(resumeText) },
        { name: "Projects", found: /project|built|developed|designed/i.test(resumeText) }
      ];

  return (
    <section className="glass-card">
      <div className="card-eyebrow">ATS Parse Preview</div>
      <p className="mb-4 text-xs text-ink/55">
        What the robot actually reads from your resume vs what you think it sees.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[rgba(26,26,46,0.08)] bg-[rgba(26,26,46,0.02)] p-4">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-ink/50">
            Raw extracted text
          </span>
          <pre className="font-mono text-[11px] leading-relaxed text-ink/60 whitespace-pre-wrap">
            {rawText}…
          </pre>
        </div>
        <div className="rounded-xl border border-[rgba(224,64,251,0.08)] bg-[rgba(224,64,251,0.03)] p-4">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-ink/50">
            Section detection
          </span>
          <div className="space-y-1.5">
            {sectionRows.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-[12px]">
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold ${
                    s.found ? "bg-[rgba(0,200,83,0.15)] text-[#007a30]" : "bg-[rgba(255,152,0,0.15)] text-[#c65d00]"
                  }`}
                >
                  {s.found ? "✓" : "?"}
                </div>
                <span className="text-ink/80">{s.name}</span>
                <span className="ml-auto text-[11px] text-ink/50">{s.found ? "detected" : "not found"}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-[rgba(26,26,46,0.06)] pt-3">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-ink/50">
              Keyword highlight
            </span>
            <div
              className="text-[11.5px] leading-relaxed text-ink/70 [&_.ats-keyword-found]:bg-[rgba(0,200,83,0.1)] [&_.ats-keyword-found]:text-[#007a30] [&_.ats-keyword-found]:rounded [&_.ats-keyword-miss]:bg-[rgba(255,23,68,0.1)] [&_.ats-keyword-miss]:text-[#b00020] [&_.ats-keyword-miss]:rounded"
              dangerouslySetInnerHTML={{ __html: highlighted.slice(0, 500) + "…" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
