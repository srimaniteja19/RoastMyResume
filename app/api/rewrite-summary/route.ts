import { NextResponse } from "next/server";
import { callAi } from "@/lib/apiAi";
import { REWRITE_SUMMARY_SYSTEM } from "@/lib/prompts";
import type { ParsedResume } from "@/lib/types/resume";

const COMPANY_GUIDANCE: Record<string, string> = {
  Meta: "moving fast, scale, ML/AI, measurable product impact",
  Apple: "polish, user experience, hardware-software integration, privacy",
  Amazon: "customer obsession, ownership, data-driven, operational excellence",
  Google: "algorithmic depth, systems at scale, CS fundamentals",
  Netflix: "autonomous senior engineers, business impact, distributed systems"
};

export async function POST(req: Request) {
  try {
    const { summary, targetCompany, resume, apiKey, provider } = (await req.json()) as {
      summary: string;
      targetCompany: string;
      resume: ParsedResume;
      apiKey?: string;
      provider?: "anthropic" | "openai" | "gemini";
    };

    if (!summary || !targetCompany) {
      return NextResponse.json({ error: "summary, targetCompany required" }, { status: 400 });
    }

    const guidance = COMPANY_GUIDANCE[targetCompany] ?? "technical excellence and impact";

    const prompt = `Rewrite this professional summary for a ${targetCompany} application.

Requirements:
- 2-3 sentences max
- Lead with years of experience + core technical strength
- Include one specific achievement metric from the resume
- Do NOT add fictional information
- Match ${targetCompany}'s culture: ${guidance}

Original: "${summary}"

Resume context (first 800 chars): ${JSON.stringify(resume).slice(0, 800)}

Return ONLY the rewritten summary text. No quotes, no preamble.`;

    const rewritten = await callAi(prompt, REWRITE_SUMMARY_SYSTEM, {
      apiKey,
      provider,
      maxTokens: 300
    });

    const summaryText = rewritten.trim().replace(/^["']|["']$/g, "");
    return NextResponse.json({ summary: summaryText || summary });
  } catch (err) {
    console.error("rewrite-summary error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rewrite failed" },
      { status: 500 }
    );
  }
}
