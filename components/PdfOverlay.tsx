"use client";

import { useEffect, useRef, useState } from "react";
import type { PhraseWithTooltip } from "@/lib/types";

type Props = {
  strongPhrases: PhraseWithTooltip[];
  weakPhrases: PhraseWithTooltip[];
};

export function PdfOverlay({ strongPhrases, weakPhrases }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const strongList = strongPhrases.map((p) => (typeof p === "string" ? { phrase: p, tooltip: "" } : p));
  const weakList = weakPhrases.map((p) => (typeof p === "string" ? { phrase: p, tooltip: "" } : p));

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const b64 = sessionStorage.getItem("rmr_pdf_base64");
      if (!b64) {
        setError("no-pdf");
        return;
      }

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        const overlay = overlayRef.current;
        if (!canvas || !overlay || cancelled) return;

        const container = canvas.parentElement;
        const containerWidth = container?.offsetWidth ?? 700;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
          canvasContext: canvas.getContext("2d")!,
          viewport: scaledViewport
        }).promise;

        if (cancelled) return;

        const textContent = await page.getTextContent();
        overlay.innerHTML = "";
        overlay.style.width = `${scaledViewport.width}px`;
        overlay.style.height = `${scaledViewport.height}px`;

        const strongPhraseStrings = strongList.map((p) => p.phrase.toLowerCase().trim());
        const weakPhraseStrings = weakList.map((p) => p.phrase.toLowerCase().trim());

        for (const item of textContent.items) {
          if (!("str" in item) || !item.str.trim() || item.str.trim().length < 3) continue;
          const txt = item.str.toLowerCase().trim();
          const strongMatch = strongPhraseStrings.findIndex((p) => p.includes(txt) || txt.includes(p) || txt.includes(p.slice(0, 12)));
          const weakMatch = strongMatch < 0 ? weakPhraseStrings.findIndex((p) => p.includes(txt) || txt.includes(p) || txt.includes(p.slice(0, 12))) : -1;
          const isStrong = strongMatch >= 0;
          const isWeak = weakMatch >= 0;
          if (!isStrong && !isWeak) continue;

          const tooltip = isStrong
            ? (strongList[strongMatch]?.tooltip?.trim() || "Strong signal — impresses recruiters")
            : (weakList[weakMatch]?.tooltip?.trim() || "Red flag — weakens your case");

          const [, , , , tx, ty] = item.transform;
          const pt1 = scaledViewport.convertToViewportPoint(tx, ty);
          const pt2 = scaledViewport.convertToViewportPoint(
            tx + item.width,
            ty + (item.height ?? 10)
          );
          const left = Math.min(pt1[0], pt2[0]);
          const top = Math.min(pt1[1], pt2[1]);
          const width = Math.abs(pt2[0] - pt1[0]);
          const height = Math.abs(pt2[1] - pt1[1]) + 2;
          if (width < 2 || height < 2) continue;

          const div = document.createElement("div");
          div.className = `absolute cursor-pointer transition-opacity ${
            isStrong
              ? "bg-[rgba(0,200,83,0.2)] border-b-2 border-[rgba(0,200,83,0.6)] hover:bg-[rgba(0,200,83,0.28)]"
              : "bg-[rgba(255,23,68,0.15)] border-b-2 border-[rgba(255,23,68,0.5)] hover:bg-[rgba(255,23,68,0.22)]"
          }`;
          div.style.cssText = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;${isStrong ? "box-shadow:0 0 10px rgba(224,64,251,0.25);" : ""}`;

          const tip = document.createElement("div");
          tip.className =
            "absolute bottom-[calc(100%+8px)] left-1/2 z-[100] min-w-[180px] max-w-[280px] -translate-x-1/2 rounded-xl bg-white px-4 py-3 text-left text-[12px] leading-relaxed text-ink shadow-[0_4px_20px_rgba(0,0,0,0.15)] pointer-events-none";
          tip.style.opacity = "0";
          tip.style.transition = "opacity 0.15s";
          tip.textContent = tooltip;

          div.addEventListener("mouseenter", () => { tip.style.opacity = "1"; });
          div.addEventListener("mouseleave", () => { tip.style.opacity = "0"; });

          div.appendChild(tip);
          overlay.appendChild(div);
        }
      } catch {
        if (!cancelled) setError("render-failed");
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [strongList, weakList]);

  if (error === "no-pdf") {
    return (
      <div className="py-12 text-center text-[13px] text-[rgba(26,26,46,0.5)]">
        PDF preview not available for text files — upload a PDF to see overlay highlights.
      </div>
    );
  }

  if (error === "render-failed") {
    return (
      <div className="py-12 text-center text-[13px] text-[rgba(26,26,46,0.5)]">
        Could not render PDF overlay.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} className="block w-full rounded-xl" style={{ height: "auto" }} />
      <div ref={overlayRef} className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto" />
    </div>
  );
}
