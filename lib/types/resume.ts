export interface ParsedResume {
  name: string;
  contact: string;
  summary: string;
  experience: Array<{
    company: string;
    title: string;
    dates: string;
    location: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    dates: string;
    gpa?: string;
  }>;
  skills: {
    raw: string;
    categories: Array<{ label: string; items: string }>;
  };
  projects: Array<{
    name: string;
    tech: string;
    bullets: string[];
  }>;
  certifications: string[];
  otherSections: Array<{ title: string; content: string }>;
}

export interface DownloadOptions {
  applyRewrites: boolean;
  highlightStrong: boolean;
  rewriteSummary: boolean;
}

export type DownloadFormat = "docx" | "pdf";

export interface ResumeAnalysis {
  verdict: string;
  percentile: number;
  weakPhrases: string[];
  strongPhrases: string[];
  improvements: Array<{ priority: string; issue: string; fix: string }>;
}
