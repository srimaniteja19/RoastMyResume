import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  buildUserPrompt,
  buildJdAnalysisPrompt,
  buildRecruiterChatContext,
  JD_ANALYSIS_SYSTEM,
  RECRUITER_CHAT_SYSTEM,
  SYSTEM_PROMPT
} from "@/lib/prompts";
import type { AnalysisResult, ApiProvider, Company } from "@/lib/types";

const improvementItemSchema = z.object({
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM"]),
  category: z.string(),
  issue: z.string(),
  fix: z.string()
});

const rewrittenBulletSchema = z.object({
  original: z.string(),
  rewritten: z.string(),
  improvement: z.string()
});

const analysisSchema = z.object({
  overall: z.object({
    verdict: z.enum(["SHORTLISTED", "ON THE FENCE", "REJECTED"]),
    overallScore: z.number().min(0).max(100),
    topPercentile: z.number().min(0).max(100),
    executiveSummary: z.string()
  }),
  ats: z.object({
    score: z.number().min(0).max(100),
    formatVerdict: z.string(),
    issues: z.array(z.string()),
    keywordsPresent: z.array(z.string()),
    keywordsMissing: z.array(z.string()),
    sectionCompleteness: z.record(z.string(), z.boolean()).optional()
  }),
  impact: z.object({
    score: z.number().min(0).max(100),
    xyzCompliance: z.string(),
    strongBullets: z.array(z.string()),
    weakBullets: z.array(z.string()),
    missingMetrics: z.string().optional(),
    verbQuality: z.string().optional(),
    weakVerbs: z.array(z.string()).optional()
  }),
  technicalDepth: z.object({
    score: z.number().min(0).max(100),
    techStackPresent: z.array(z.string()),
    senioritySignals: z.array(z.string()),
    seniorityGaps: z.array(z.string()),
    depthVerdict: z.string()
  }),
  recruiterEye: z.object({
    score: z.number().min(0).max(100),
    firstImpression: z.string(),
    narrativeClarity: z.string(),
    positioningVerdict: z.string(),
    redFlags: z.array(z.string()),
    greenFlags: z.array(z.string())
  }),
  companyFit: z.object({
    cultureFitScore: z.number().min(0).max(100),
    techFitScore: z.number().min(0).max(100),
    companySpecificStrengths: z.array(z.string()),
    companySpecificGaps: z.array(z.string()),
    recruiterNote: z.string()
  }),
  phrases: z.object({
    strongPhrases: z.array(z.object({
      phrase: z.string(),
      tooltip: z.string()
    })).default([]),
    weakPhrases: z.array(z.object({
      phrase: z.string(),
      tooltip: z.string()
    })).default([]),
    overusedBuzzwords: z.array(z.string()).optional()
  }),
  improvements: z.array(improvementItemSchema),
  rewrittenBullets: z.array(rewrittenBulletSchema),
  oneLinerPitch: z.string().optional(),
  suggestedHeadline: z.string().optional(),
  interviewQuestions: z.array(z.string()).optional(),
  topActions: z.array(z.string()).optional()
});

function getModel(provider: ApiProvider, apiKey: string) {
  switch (provider) {
    case "anthropic":
      return createAnthropic({
        apiKey,
        headers: { "anthropic-dangerous-direct-browser-access": "true" }
      })("claude-sonnet-4-20250514");
    case "openai":
      return createOpenAI({ apiKey })("gpt-4o");
    case "gemini":
      return createGoogleGenerativeAI({ apiKey })("gemini-2.5-flash");
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

function normalizePhrases(raw: unknown): { phrase: string; tooltip: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => {
    if (typeof x === "object" && x !== null && "phrase" in x && typeof (x as { phrase: string }).phrase === "string") {
      return { phrase: (x as { phrase: string }).phrase, tooltip: ((x as { tooltip?: string }).tooltip ?? "").trim() || "Strong signal" };
    }
    if (typeof x === "string") return { phrase: x, tooltip: "" };
    return { phrase: "", tooltip: "" };
  }).filter((x) => x.phrase.length > 0);
}

export async function analyzeResume(
  provider: ApiProvider,
  apiKey: string,
  company: Company,
  resumeText: string
): Promise<AnalysisResult> {
  const model = getModel(provider, apiKey);

  const { output } = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(company, resumeText),
    maxOutputTokens: 10000,
    output: Output.object({ schema: analysisSchema })
  });

  if (!output) throw new Error("No response from model. Try again.");
  const p = output as z.infer<typeof analysisSchema>;

  return {
    overall: {
      verdict: p.overall.verdict,
      overallScore: clamp(p.overall.overallScore),
      topPercentile: clamp(p.overall.topPercentile),
      executiveSummary: p.overall.executiveSummary ?? ""
    },
    ats: {
      score: clamp(p.ats.score),
      formatVerdict: p.ats.formatVerdict ?? "UNKNOWN",
      issues: p.ats.issues ?? [],
      keywordsPresent: p.ats.keywordsPresent ?? [],
      keywordsMissing: p.ats.keywordsMissing ?? [],
      sectionCompleteness: p.ats.sectionCompleteness ?? {}
    },
    impact: {
      score: clamp(p.impact.score),
      xyzCompliance: p.impact.xyzCompliance ?? "",
      strongBullets: p.impact.strongBullets ?? [],
      weakBullets: p.impact.weakBullets ?? [],
      missingMetrics: p.impact.missingMetrics ?? "",
      verbQuality: p.impact.verbQuality ?? "MIXED",
      weakVerbs: p.impact.weakVerbs ?? []
    },
    technicalDepth: {
      score: clamp(p.technicalDepth.score),
      techStackPresent: p.technicalDepth.techStackPresent ?? [],
      senioritySignals: p.technicalDepth.senioritySignals ?? [],
      seniorityGaps: p.technicalDepth.seniorityGaps ?? [],
      depthVerdict: p.technicalDepth.depthVerdict ?? ""
    },
    recruiterEye: {
      score: clamp(p.recruiterEye.score),
      firstImpression: p.recruiterEye.firstImpression ?? "",
      narrativeClarity: p.recruiterEye.narrativeClarity ?? "",
      positioningVerdict: p.recruiterEye.positioningVerdict ?? "",
      redFlags: p.recruiterEye.redFlags ?? [],
      greenFlags: p.recruiterEye.greenFlags ?? []
    },
    companyFit: {
      cultureFitScore: clamp(p.companyFit.cultureFitScore),
      techFitScore: clamp(p.companyFit.techFitScore),
      companySpecificStrengths: p.companyFit.companySpecificStrengths ?? [],
      companySpecificGaps: p.companyFit.companySpecificGaps ?? [],
      recruiterNote: p.companyFit.recruiterNote ?? ""
    },
    phrases: {
      strongPhrases: normalizePhrases(p.phrases.strongPhrases),
      weakPhrases: normalizePhrases(p.phrases.weakPhrases),
      overusedBuzzwords: p.phrases.overusedBuzzwords ?? []
    },
    improvements: p.improvements ?? [],
    rewrittenBullets: p.rewrittenBullets ?? [],
    oneLinerPitch: p.oneLinerPitch ?? "",
    suggestedHeadline: p.suggestedHeadline ?? "",
    interviewQuestions: p.interviewQuestions ?? [],
    topActions: p.topActions ?? []
  };
}

const jdAnalysisSchema = z.object({
  jdAlignmentScore: z.number().min(0).max(100),
  keywordGaps: z.array(z.string()),
  keywordsMatched: z.array(z.string()),
  tailoredSummary: z.string(),
  suggestedAdditions: z.array(z.string())
});

export type JdAnalysisResult = z.infer<typeof jdAnalysisSchema>;

export async function chatWithRecruiter(
  provider: ApiProvider,
  apiKey: string,
  company: Company,
  resumeText: string,
  analysis: AnalysisResult,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const model = getModel(provider, apiKey);
  const context = buildRecruiterChatContext(company, resumeText, analysis);

  const chatMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content
  }));

  const { text } = await generateText({
    model,
    system: `${RECRUITER_CHAT_SYSTEM}\n\nContext:\n${context}`,
    messages: chatMessages,
    maxOutputTokens: 800
  });

  return text ?? "";
}

export async function analyzeResumeAgainstJD(
  provider: ApiProvider,
  apiKey: string,
  company: Company,
  resumeText: string,
  jdText: string
): Promise<JdAnalysisResult> {
  const model = getModel(provider, apiKey);

  const { output } = await generateText({
    model,
    system: JD_ANALYSIS_SYSTEM,
    prompt: buildJdAnalysisPrompt(company, resumeText, jdText),
    maxOutputTokens: 2000,
    output: Output.object({ schema: jdAnalysisSchema })
  });

  if (!output) throw new Error("No response from model. Try again.");
  const p = output as z.infer<typeof jdAnalysisSchema>;

  return {
    jdAlignmentScore: clamp(p.jdAlignmentScore),
    keywordGaps: p.keywordGaps ?? [],
    keywordsMatched: p.keywordsMatched ?? [],
    tailoredSummary: p.tailoredSummary ?? "",
    suggestedAdditions: p.suggestedAdditions ?? []
  };
}
