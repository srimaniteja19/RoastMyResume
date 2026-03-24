"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SCAN_DURATION = 7;
const CALLOUTS = [
  "Name & title — first impression in 0.5s",
  "Current role — where you are now",
  "Experience & timeline — career progression",
  "Numbers? — did you quantify impact?",
  "Tech stack — do the keywords match?",
  "Red flags — vague verbs, gaps?",
  "Verdict forming — shortlist or pass?"
];

type Band = { top: number; height: number; left: number; width: number; str: string }[];

type Props = {
  onComplete?: () => void;
  verdict?: "SHORTLISTED" | "ON THE FENCE" | "REJECTED";
};

export function RecruiterSimulation({ onComplete, verdict }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [second, setSecond] = useState(0);
  const [scanPercent, setScanPercent] = useState(0);
  const [bands, setBands] = useState<Band[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const b64 = sessionStorage.getItem("rmr_pdf_base64");
    if (!b64) {
      setError("no-pdf");
      return;
    }

    let cancelled = false;

    async function run() {
      if (!b64) return;
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 150));

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || cancelled) return;

      const measured = container.offsetWidth || 0;
      const w = measured >= 200 ? measured : 700;

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const page = await pdf.getPage(1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = w / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        setDimensions({ width: scaledViewport.width, height: scaledViewport.height });

        await page.render({
          canvasContext: canvas.getContext("2d")!,
          viewport: scaledViewport
        }).promise;
        if (cancelled) return;

        const textContent = await page.getTextContent();
        const items: { top: number; height: number; left: number; width: number; str: string }[] = [];

        for (const item of textContent.items) {
          if (!("str" in item) || !item.str.trim()) continue;
          const [, , , , tx, ty] = item.transform;
          const pt1 = scaledViewport.convertToViewportPoint(tx, ty);
          const pt2 = scaledViewport.convertToViewportPoint(tx + item.width, ty + (item.height ?? 10));
          const left = Math.min(pt1[0], pt2[0]);
          const top = Math.min(pt1[1], pt2[1]);
          const width = Math.abs(pt2[0] - pt1[0]);
          const height = Math.abs(pt2[1] - pt1[1]) + 2;
          if (width >= 2 && height >= 2) items.push({ top, height, left, width, str: item.str });
        }

        const pageHeight = scaledViewport.height;
        const bandHeight = pageHeight / SCAN_DURATION;
        const grouped: Band[] = Array.from({ length: SCAN_DURATION }, () => []);
        for (const it of items) {
          const centerY = it.top + it.height / 2;
          const bandIdx = Math.min(Math.floor(centerY / bandHeight), SCAN_DURATION - 1);
          grouped[bandIdx].push(it);
        }

        setBands(grouped);
        setReady(true);
      } catch {
        if (!cancelled) setError("render-failed");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  function startSimulation() {
    setPlaying(true);
    setSecond(0);
    setScanPercent(0);
  }

  useEffect(() => {
    if (!playing) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setScanPercent(Math.min((elapsed / SCAN_DURATION) * 100, 100));
      setSecond(Math.min(Math.floor(elapsed), SCAN_DURATION));
      if (elapsed < SCAN_DURATION) requestAnimationFrame(tick);
      else setTimeout(() => { setPlaying(false); onComplete?.(); }, 800);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, onComplete]);

  if (error === "no-pdf") {
    return (
      <div className="py-8 text-center text-[13px] text-[rgba(26,26,46,0.5)]">
        Upload a PDF to see the recruiter simulation.
      </div>
    );
  }
  if (error === "render-failed") {
    return (
      <div className="py-8 text-center text-[13px] text-[rgba(26,26,46,0.5)]">
        Could not load PDF for simulation.
      </div>
    );
  }

  const hasCompleted = !playing && second >= SCAN_DURATION;

  return (
    <div className="relative w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[12px] text-ink/60">
          {playing ? `Recruiter scanning… ${second}s` : "A recruiter spends ~7 seconds on your resume. See what they notice."}
        </p>
        {!playing ? (
          <button
            type="button"
            onClick={startSimulation}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #e040fb 0%, #b044ff 100%)" }}
          >
            <Play className="h-4 w-4" /> Watch 7s scan
          </button>
        ) : (
          <span className="rounded-full bg-ink/10 px-4 py-2 text-sm font-mono font-semibold text-ink">
            {SCAN_DURATION - second}s left
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
        style={{ minHeight: 400 }}
      >
        {!ready && (
          <div className="flex min-h-[400px] items-center justify-center text-sm text-ink/40">
            Loading PDF…
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block w-full bg-white"
          style={
            dimensions.height > 0
              ? { width: dimensions.width, height: dimensions.height, maxWidth: "100%" }
              : { visibility: "hidden", minHeight: 400 }
          }
        />
        <div
          ref={overlayRef}
          className="pointer-events-none absolute left-0 top-0"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {playing && bands[second]?.map((b, i) => (
            <div
              key={i}
              className="absolute rounded bg-[rgba(224,64,251,0.25)] ring-2 ring-[rgba(224,64,251,0.6)]"
              style={{ left: b.left, top: b.top, width: b.width, height: b.height }}
            />
          ))}
        </div>
        {playing && (
          <div
            className="absolute left-0 right-0 z-10 h-[2px] bg-[#e040fb] shadow-[0_0_12px_rgba(224,64,251,0.8)]"
            style={{ top: `${scanPercent}%` }}
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        {playing && second < CALLOUTS.length && (
          <motion.div
            key={second}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 rounded-xl border border-[rgba(224,64,251,0.3)] bg-[rgba(224,64,251,0.08)] px-4 py-3"
          >
            <p className="text-[13px] font-medium text-ink">
              <span className="text-[#e040fb]">Second {second + 1}:</span> {CALLOUTS[second]}
            </p>
          </motion.div>
        )}
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-ink/5 px-4 py-3"
          >
            <p className="text-[13px] font-medium text-ink">
              {verdict === "SHORTLISTED"
                ? "✅ Would read further — based on first 7 seconds, a recruiter would continue reading."
                : verdict === "ON THE FENCE"
                  ? "🤔 Borderline — would skim more before deciding."
                  : verdict === "REJECTED"
                    ? "❌ Passed to next candidate — based on first 7 seconds, a recruiter would likely move on."
                    : "That's what a recruiter saw in 7 seconds."}
            </p>
            <button
              type="button"
              onClick={startSimulation}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#b044ff] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Replay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
