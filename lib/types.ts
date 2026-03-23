export const companies = ["Meta", "Apple", "Amazon", "Google", "Netflix"] as const;
export type Company = (typeof companies)[number];

export type ImprovementItem = {
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  category: string;
  issue: string;
  fix: string;
};

export type PhraseWithTooltip = {
  phrase: string;
  tooltip: string;
};

export type RewrittenBullet = {
  original: string;
  rewritten: string;
  improvement: string;
};

export type AnalysisResult = {
  overall: {
    verdict: "SHORTLISTED" | "ON THE FENCE" | "REJECTED";
    overallScore: number;
    topPercentile: number;
    executiveSummary: string;
  };
  ats: {
    score: number;
    formatVerdict: string;
    issues: string[];
    keywordsPresent: string[];
    keywordsMissing: string[];
    sectionCompleteness: Record<string, boolean>;
  };
  impact: {
    score: number;
    xyzCompliance: string;
    strongBullets: string[];
    weakBullets: string[];
    missingMetrics: string;
    verbQuality: string;
    weakVerbs: string[];
  };
  technicalDepth: {
    score: number;
    techStackPresent: string[];
    senioritySignals: string[];
    seniorityGaps: string[];
    depthVerdict: string;
  };
  recruiterEye: {
    score: number;
    firstImpression: string;
    narrativeClarity: string;
    positioningVerdict: string;
    redFlags: string[];
    greenFlags: string[];
  };
  companyFit: {
    cultureFitScore: number;
    techFitScore: number;
    companySpecificStrengths: string[];
    companySpecificGaps: string[];
    recruiterNote: string;
  };
  phrases: {
    strongPhrases: PhraseWithTooltip[];
    weakPhrases: PhraseWithTooltip[];
    overusedBuzzwords: string[];
  };
  improvements: ImprovementItem[];
  rewrittenBullets: RewrittenBullet[];
  oneLinerPitch?: string;
  suggestedHeadline?: string;
  interviewQuestions?: string[];
  topActions?: string[];
}

export type ApiProvider = "anthropic" | "openai" | "gemini";
