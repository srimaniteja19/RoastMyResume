"use client";

import type { DownloadFormat, DownloadOptions } from "@/lib/types/resume";

type Props = {
  format: DownloadFormat;
  options: DownloadOptions;
  onFormatChange: (format: DownloadFormat) => void;
  onOptionsChange: (options: Partial<DownloadOptions>) => void;
};

export function FormatPicker({ format, options, onFormatChange, onOptionsChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">Format</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onFormatChange("docx")}
            className={`flex-1 rounded-xl border px-4 py-3 text-[13px] font-semibold transition ${
              format === "docx"
                ? "border-[#b044ff] bg-[rgba(176,68,255,0.08)] text-[#b044ff]"
                : "border-ink/15 bg-white text-ink/70 hover:border-ink/25"
            }`}
          >
            DOCX
          </button>
          <button
            type="button"
            onClick={() => onFormatChange("pdf")}
            className={`flex-1 rounded-xl border px-4 py-3 text-[13px] font-semibold transition ${
              format === "pdf"
                ? "border-[#b044ff] bg-[rgba(176,68,255,0.08)] text-[#b044ff]"
                : "border-ink/15 bg-white text-ink/70 hover:border-ink/25"
            }`}
          >
            PDF (print)
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">Options</p>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={options.applyRewrites}
              onChange={(e) => onOptionsChange({ applyRewrites: e.target.checked })}
              className="h-4 w-4 rounded border-ink/20 text-[#b044ff] focus:ring-[#b044ff]"
            />
            <span className="text-[13px] text-ink">Rewrite weak bullets (XYZ formula)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={options.highlightStrong}
              onChange={(e) => onOptionsChange({ highlightStrong: e.target.checked })}
              className="h-4 w-4 rounded border-ink/20 text-[#b044ff] focus:ring-[#b044ff]"
            />
            <span className="text-[13px] text-ink">Bold strong phrases</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={options.rewriteSummary}
              onChange={(e) => onOptionsChange({ rewriteSummary: e.target.checked })}
              className="h-4 w-4 rounded border-ink/20 text-[#b044ff] focus:ring-[#b044ff]"
            />
            <span className="text-[13px] text-ink">Rewrite summary for target company</span>
          </label>
        </div>
      </div>
    </div>
  );
}
