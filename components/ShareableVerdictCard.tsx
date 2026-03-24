"use client";

import type { AnalysisResult, Company } from "@/lib/types";

const AXES = [
  { getScore: (r: AnalysisResult) => r.impact.score },
  { getScore: (r: AnalysisResult) => r.technicalDepth.score },
  { getScore: (r: AnalysisResult) => r.ats.score },
  { getScore: (r: AnalysisResult) => r.recruiterEye.score },
  { getScore: (r: AnalysisResult) => r.companyFit.cultureFitScore },
  { getScore: (r: AnalysisResult) => r.companyFit.techFitScore }
];

const RADIUS = 120;
const CENTER = 150;

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

type Props = {
  result: AnalysisResult;
  company: Company;
};

export function ShareableVerdictCard({ result, company }: Props) {
  const scores = AXES.map((a) => a.getScore(result));
  const points = getPolygonPoints(scores);
  const percentile = result.overall.topPercentile;
  const verdict = result.overall.verdict;

  const verdictEmoji = verdict === "SHORTLISTED" ? "🔥" : verdict === "ON THE FENCE" ? "⚡" : "💪";

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: 1200,
        height: 630,
        background: "linear-gradient(135deg, #e8f3fd 0%, #d4e8fa 25%, #fce4ec 60%, #f3e5f5 100%)",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        boxSizing: "border-box",
        padding: 48
      }}
    >
      <div
        className="text-center font-bold"
        style={{
          fontSize: 28,
          color: "rgba(26,26,46,0.6)",
          letterSpacing: "0.25em",
          marginBottom: 12
        }}
      >
        ROASTMYRESUME
      </div>

      <div
        className="text-center font-extrabold"
        style={{
          fontSize: 64,
          color: "#1a1a2e",
          lineHeight: 1.15,
          marginBottom: 12,
          maxWidth: 1000
        }}
      >
        {percentile}th percentile at {company} {verdictEmoji}
      </div>

      <div
        style={{
          fontSize: 24,
          color: "rgba(26,26,46,0.5)",
          marginBottom: 32
        }}
      >
        {verdict === "SHORTLISTED" && "Your resume would make the cut"}
        {verdict === "ON THE FENCE" && "Room to improve — you've got this"}
        {verdict === "REJECTED" && "Time for a resume glow-up"}
      </div>

      <div
        style={{
          width: 340,
          height: 340,
          flexShrink: 0
        }}
      >
        <svg viewBox="0 0 300 300" width={340} height={340} style={{ overflow: "visible" }}>
          {[25, 50, 75, 100].map((pct) => (
            <circle
              key={pct}
              cx={CENTER}
              cy={CENTER}
              r={(pct / 100) * RADIUS}
              fill="none"
              stroke="rgba(26,26,46,0.1)"
              strokeWidth="2"
            />
          ))}
          {AXES.map((_, i) => {
            const angle = (i / AXES.length) * 2 * Math.PI - Math.PI / 2;
            const x = CENTER + RADIUS * Math.cos(angle);
            const y = CENTER - RADIUS * Math.sin(angle);
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke="rgba(26,26,46,0.15)"
                strokeWidth="2"
              />
            );
          })}
          <polygon
            points={points}
            fill="rgba(224,64,251,0.25)"
            stroke="rgba(224,64,251,0.8)"
            strokeWidth="4"
          />
        </svg>
      </div>

      <div
        style={{
          fontSize: 20,
          color: "rgba(26,26,46,0.5)",
          marginTop: 20
        }}
      >
        roastmyresume.com · Share your score
      </div>
    </div>
  );
}
