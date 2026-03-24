import { NextResponse } from "next/server";
import { callAi } from "@/lib/apiAi";
import { PARSE_RESUME_SCHEMA, PARSE_RESUME_SYSTEM } from "@/lib/prompts";
import type { ParsedResume } from "@/lib/types/resume";

export async function POST(req: Request) {
  try {
    const { resumeText, apiKey, provider } = (await req.json()) as {
      resumeText: string;
      apiKey?: string;
      provider?: "anthropic" | "openai" | "gemini";
    };

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
    }

    const prompt = `Parse this resume into the exact JSON structure provided. Preserve ALL content — do not summarize, skip, or reorder anything.

Resume:
---
${resumeText.slice(0, 12000)}
---

Return ONLY valid JSON matching this structure:
${PARSE_RESUME_SCHEMA}

No markdown, no code fences, no explanation.`;

    const raw = await callAi(prompt, PARSE_RESUME_SYSTEM, {
      apiKey,
      provider,
      maxTokens: 6000
    });

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Failed to parse AI response as JSON" }, { status: 400 });
    }

    const parsed = JSON.parse(match[0]) as ParsedResume;

    // Ensure required fields exist
    if (!parsed.experience) parsed.experience = [];
    if (!parsed.education) parsed.education = [];
    if (!parsed.skills)
      parsed.skills = { raw: "", categories: [] };
    if (!parsed.projects) parsed.projects = [];
    if (!parsed.certifications) parsed.certifications = [];
    if (!parsed.otherSections) parsed.otherSections = [];

    return NextResponse.json({ parsed });
  } catch (err) {
    console.error("parse-resume error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Parse failed" },
      { status: 500 }
    );
  }
}
