"use client";

import { motion } from "framer-motion";
import type { AnalysisResult } from "@/lib/types";

const AXES = [
  { key: "impact", label: "Impact", getScore: (r: AnalysisResult) => r.impact.score },
  { key: "techDepth", label: "Tech Depth", getScore: (r: AnalysisResult) => r.technicalDepth.score },
  { key: "ats", label: "ATS", getScore: (r: AnalysisResult) => r.ats.score },
  { key: "clarity", label: "Clarity", getScore: (r: AnalysisResult) => r.recruiterEye.score },
  { key: "culture", label: "Culture", getScore: (r: AnalysisResult) => r.companyFit.cultureFitScore },
  { key: "techFit", label: "Tech Fit", getScore: (r: AnalysisResult) => r.companyFit.techFitScore }
] as const;

const RADIUS = 80;
const CENTER = 100;

function scoreToRadius(score: number) {
  return (score / 100) * RADIUS;
}

function getPolygonPoints(scores: number[]) {
  const n = AXES.length;
  return scores
    .map((s, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const r = scoreToRadius(s);
      const x = CENTER + r * Math.cos(angle);
      const y = CENTER - r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");
}

function getAxisEndpoints() {
  const n = AXES.length;
  return AXES.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const x = CENTER + RADIUS * Math.cos(angle);
    const y = CENTER - RADIUS * Math.sin(angle);
    return { x, y, label: AXES[i].label };
  });
}

type Props = {
  result: AnalysisResult;
};

export function RadarChart({ result }: Props) {
  const scores = AXES.map((a) => a.getScore(result));
  const points = getPolygonPoints(scores);
  const axisEnds = getAxisEndpoints();

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 200"
        className="h-[220px] w-[220px] max-w-full"
        style={{ overflow: "visible" }}
      >
        {/* Grid circles */}
        {[25, 50, 75, 100].map((pct) => (
          <circle
            key={pct}
            cx={CENTER}
            cy={CENTER}
            r={(pct / 100) * RADIUS}
            fill="none"
            stroke="rgba(26,26,46,0.08)"
            strokeWidth="0.5"
          />
        ))}

        {/* Axis lines */}
        {axisEnds.map(({ x, y }, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="rgba(26,26,46,0.12)"
            strokeWidth="0.5"
          />
        ))}

        {/* Axis labels */}
        {axisEnds.map(({ x, y, label }, i) => {
          const extend = 1.15;
          const lx = CENTER + (x - CENTER) * extend;
          const ly = CENTER + (y - CENTER) * extend;
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[rgba(26,26,46,0.6)] text-[9px] font-semibold"
            >
              {label}
            </text>
          );
        })}

        {/* Data polygon */}
        <motion.polygon
          points={points}
          fill="rgba(224,64,251,0.2)"
          stroke="rgba(224,64,251,0.7)"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-ink/50">
        {AXES.map((a, i) => (
          <span key={a.key}>
            {a.label}: <strong className="text-ink/70">{scores[i]}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
