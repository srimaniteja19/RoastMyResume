import { NextResponse } from "next/server";
import { callAi } from "@/lib/apiAi";
import { REWRITE_BULLETS_SYSTEM } from "@/lib/prompts";
import type { ParsedResume, ResumeAnalysis } from "@/lib/types/resume";

const WEAK_VERBS = [
  "worked",
  "helped",
  "assisted",
  "responsible for",
  "involved in",
  "supported",
  "participated",
  "contributed",
  "collaborated",
  "aided"
];

function hasMetrics(text: string): boolean {
  return /\d|%/.test(text);
}

function isWeakBullet(bullet: string, weakPhrases: string[]): boolean {
  const lower = bullet.toLowerCase();
  if (weakPhrases.some((p) => lower.includes(p.toLowerCase()))) return true;
  if (WEAK_VERBS.some((v) => new RegExp(`\\b${v}\\b`).test(lower))) return true;
  if (!hasMetrics(bullet)) return true;
  return false;
}

export async function POST(req: Request) {
  try {
    const { resume, analysis, targetCompany, apiKey, provider } = (await req.json()) as {
      resume: ParsedResume;
      analysis: ResumeAnalysis;
      targetCompany: string;
      apiKey?: string;
      provider?: "anthropic" | "openai" | "gemini";
    };

    if (!resume || !analysis || !targetCompany) {
      return NextResponse.json({ error: "resume, analysis, targetCompany required" }, { status: 400 });
    }

    const weakPhrases = analysis.weakPhrases ?? [];
    const toRewrite: { bullet: string; company: string; title: string; expIdx: number; bulletIdx: number }[] = [];

    resume.experience?.forEach((exp, expIdx) => {
      exp.bullets?.forEach((bullet, bulletIdx) => {
        if (isWeakBullet(bullet, weakPhrases) && toRewrite.length < 8) {
          toRewrite.push({
            bullet,
            company: exp.company,
            title: exp.title,
            expIdx,
            bulletIdx
          });
        }
      });
    });

    if (toRewrite.length === 0) {
      return NextResponse.json({ resume });
    }

    const bulletsBlock = toRewrite
      .map(
        (t, i) =>
          `[${i + 1}] ${t.company} — ${t.title}\n${t.bullet}`
      )
      .join("\n\n");

    const prompt = `Rewrite these ${toRewrite.length} resume bullets for a ${targetCompany} application. For each, keep the same role/company context but make it impact-first with metrics.

Bullets to rewrite:
${bulletsBlock}

Return ONLY a JSON array of ${toRewrite.length} rewritten strings in the same order. If a bullet cannot be meaningfully improved, return it unchanged.`;

    const raw = await callAi(prompt, REWRITE_BULLETS_SYSTEM, {
      apiKey,
      provider,
      maxTokens: 2000
    });

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ error: "Failed to parse rewrite response" }, { status: 400 });
    }

    const rewrites = JSON.parse(match[0]) as string[];
    const resumeCopy = JSON.parse(JSON.stringify(resume)) as ParsedResume;

    toRewrite.forEach((t, i) => {
      const rewritten = rewrites[i];
      if (rewritten && resumeCopy.experience?.[t.expIdx]?.bullets?.[t.bulletIdx] !== undefined) {
        resumeCopy.experience![t.expIdx].bullets![t.bulletIdx] = rewritten;
      }
    });

    return NextResponse.json({ resume: resumeCopy });
  } catch (err) {
    console.error("rewrite-bullets error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rewrite failed" },
      { status: 500 }
    );
  }
}
